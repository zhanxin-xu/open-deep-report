import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import {
  BaseChatModel,
  BaseChatModelParams,
} from "@langchain/core/language_models/chat_models";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatVertexAI } from "@langchain/google-vertexai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";
import {
  GEMINI_API_KEY,
  geminiConfig,
  getLLMConfig,
  LLMProvider,
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
  openaiConfig,
} from "./config";

export function getLLm(params?: {
  stream?: boolean;
  model?: string;
  temperature?: number;
  provider?: LLMProvider;
}): BaseChatModel {
  params = params || {};
  const config = getLLMConfig({
    provider: params.provider,
    model: params.model,
    temperature: params.temperature,
  });
  if (config.provider === "openai") {
    return new ChatOpenAI({
      model: config.model,
      temperature: params.temperature,
      verbose: false,
      streaming: params.stream,
      configuration: {
        apiKey: openaiConfig.apiKey,
        baseURL: openaiConfig.baseURL,
      },
    });
  } else if (config.provider === "gemini") {
    if (geminiConfig.credentialsPath) {
      return new ChatVertexAI({
        model: config.model,
        temperature: config.temperature,
        location: "us-central1",
        endpoint: "aiplatform.googleapis.com",
      });
    } else if (geminiConfig.apiKey) {
      return new ChatGoogleGenerativeAI({
        model: config.model,
        temperature: config.temperature,
        apiKey: GEMINI_API_KEY,
      });
    } else {
      throw new Error(
        "No LLM provider is enabled. Please configure at least one provider."
      );
    }
  } else {
    throw new Error(
      "No LLM provider is enabled. Please configure at least one provider."
    );
  }
}

/**
 * 自定义的千问聊天模型类，专门用于处理reasoning_content
 */
export class QwenChatModel extends BaseChatModel {
  modelName: string;
  temperature: number;
  streaming: boolean;
  openai: OpenAI;

  constructor(
    fields?: {
      modelName?: string;
      temperature?: number;
      streaming?: boolean;
    } & Partial<BaseChatModelParams>
  ) {
    // 传递BaseChatModelParams到父类构造函数
    super(fields || {});
    this.modelName = fields?.modelName || "qwq-plus-latest";
    this.temperature = fields?.temperature ?? 0;
    this.streaming = fields?.streaming ?? true;
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: OPENAI_BASE_URL,
    });
  }

  _llmType() {
    return "qwen-chat";
  }

  async _generate(
    messages: BaseMessage[],
    options: any,
    runManager?: CallbackManagerForLLMRun
  ): Promise<{ generations: Array<{ text: string; message: AIMessage }> }> {
    // 转换消息格式为OpenAI格式
    const formattedMessages = messages.map((message) => ({
      role: this._convertRole(message._getType()),
      content: message.content,
    }));

    try {
      const content = await this._streamingGenerate(
        formattedMessages,
        runManager
      );

      return {
        generations: [
          {
            text: content.answerContent,
            message: new AIMessage({
              content: content.answerContent,
              additional_kwargs: {
                reasoning: content.reasoningContent,
              },
            }),
          },
        ],
      };
    } catch (error) {
      console.error("Error generating from QwenChatModel:", error);
      throw error;
    }
  }

  /**
   * 处理流式生成
   */
  private async _streamingGenerate(
    messages: any[],
    runManager?: CallbackManagerForLLMRun
  ): Promise<{ reasoningContent: string; answerContent: string }> {
    let reasoningContent = "";
    let answerContent = "";

    try {
      // 调用模型 - 必须使用流式模式
      const stream = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: messages,
        temperature: this.temperature,
        stream: true, // 千问qwq-plus-latest模型只支持流式模式
      });

      // 处理流式响应
      for await (const chunk of stream) {
        if (!chunk.choices?.length) {
          continue;
        }

        const delta = chunk.choices[0].delta as any;

        // 处理思考过程
        if (delta.reasoning_content) {
          reasoningContent += delta.reasoning_content;
          runManager?.handleLLMNewToken(delta.reasoning_content);
          runManager?.handleCustomEvent("reasoning", delta.reasoning_content);
        }
        // 处理正式回复
        else if (delta.content) {
          answerContent += delta.content;
          // 发送新token给回调管理器
          await runManager?.handleLLMNewToken(delta.content);
        }
      }

      return {
        reasoningContent,
        answerContent,
      };
    } catch (error) {
      console.error("千问推理模型调用错误:", error);
      return {
        reasoningContent: `Error during reasoning: ${error}`,
        answerContent: "Error occurred during model invocation",
      };
    }
  }

  /**
   * 将LangChain消息类型转换为OpenAI所需的角色格式
   */
  private _convertRole(role: string): string {
    switch (role) {
      case "human":
        return "user";
      case "ai":
        return "assistant";
      case "system":
        return "system";
      default:
        return role;
    }
  }
}

/**
 * 获取支持reasoning_content的LLM实例
 * 该函数返回QwenChatModel实例，能够捕获千问模型的reasoning_content字段
 */
export function getReasoningLLm(): BaseChatModel {
  return new QwenChatModel({
    modelName: "qwq-plus-2025-03-05",
    temperature: 0.7,
    streaming: true,
  });
}

export function getOpenaiEmbeddings(): OpenAIEmbeddings {
  console.log(OPENAI_API_KEY, OPENAI_BASE_URL);
  return new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
    modelName: "text-embedding-v3",
    configuration: {
      baseURL: OPENAI_BASE_URL,
    },
  });
}
