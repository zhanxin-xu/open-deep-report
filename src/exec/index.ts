import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";
import { MessageContentText } from "@langchain/core/messages";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { TavilySearch } from "@langchain/tavily";
import z from "zod";
import { TAVILY_API_KEY } from "../config";
import { getLLm } from "../llm";
import { ExecState, Source } from "../state";

export async function SplitGaps(
  state: Partial<typeof ExecState.State>
): Promise<Partial<typeof ExecState.State>> {
  const { task, all_sub_reports, all_sources } = state;
  const llm = getLLm();
  const prompt = `
<Role>
您是一位经验丰富的研究人员。您已经完成的部分草稿已包含在“<Content>”标签内。
您当前正在处理名为“{task}”的这一部分。
将这一部分分解为若干独立的、原子化的搜索任务。每个任务都应互相独立并完全不同。
</Role>

<Content>
{content}
</Content>

<OutputSchema>
{output_schema}
</OutputSchema>
  `;

  const outputSchema = z.object({
    search_gaps: z.array(z.string()).max(10),
  });

  const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);
  const chain = PromptTemplate.fromTemplate(prompt)
    .pipe(llm)
    .pipe(outputParser);

  const response = await chain.invoke({
    task: task,
    content: (all_sub_reports ?? [])
      .map((report) => `${report.title}\n${report.content}\n`)
      .join("\n"),
    output_schema: outputParser.getFormatInstructions(),
  });
  return {
    gaps: response.search_gaps,
  };
}

export async function ExecSearch(current_gap: string): Promise<Source[]> {
  const llm = getLLm();
  const tavilySearch = new TavilySearch({
    tavilyApiKey: TAVILY_API_KEY,
    maxResults: 5,
  });
  const prompt = `
<Role>
You are a search expert. Based on the following task, generate a concise list of search keywords that will help locate authoritative sources.

Current task: {current_gap}
</Role>

<OutputSchema>
{output_schema}
</OutputSchema>
  `;

  const outputSchema = z.object({
    search_keywords: z.array(z.string()).max(5),
  });

  const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);
  const chain = PromptTemplate.fromTemplate(prompt)
    .pipe(llm)
    .pipe(outputParser);

  const response = await chain.invoke({
    current_gap: current_gap,
    output_schema: outputParser.getFormatInstructions(),
  });

  const search_keywords = response.search_keywords;

  console.log(`search keywords: ${search_keywords.join(",")}`);

  const results = await tavilySearch.invoke({
    query: search_keywords.join(","),
  });

  const getLinkContent = async (url: string) => {
    const loader = new PlaywrightWebBaseLoader(url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      },
    });
    const html = await loader.scrape();
    let contentStr = html
      // 移除 <style> 标签及其内容
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // 移除 <script> 标签及其内容
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      // 在块级元素前后添加换行符，保持段落结构
      .replace(
        /<\/(div|p|h[1-6]|li|section|article|header|footer|main|aside|nav|blockquote|pre|address)[^>]*>/gi,
        "\n"
      )
      .replace(/<(br|hr)[^>]*\/?>/gi, "\n")
      // 移除所有HTML标签
      .replace(/<[^>]*>/g, "")
      // 将多个连续换行符合并为最多两个
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // 移除每行前后的空白字符但保留换行
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // 移除开头和结尾的空白字符
      .trim();
    return contentStr;
  };
  return await Promise.all(
    results.results.map(
      async (result: { title: string; url: string; content: string }) => {
        let content = result.content;
        try {
          content = await getLinkContent(result.url);
        } catch (error) {
          console.error(`error when get link content: ${result.url}`, error);
        }
        return {
          title: result.title,
          url: result.url,
          content: content,
        };
      }
    )
  );
}

// 汇总当前阶段报告
export async function SummarizeReport(
  state: Partial<typeof ExecState.State>
): Promise<Partial<typeof ExecState.State>> {
  const { all_sub_reports, sources, task } = state;
  const llm = getLLm();
  const prompt = `
<Role>
你是一位资深学术研究员，正在撰写一份学术报告中的一部分。请注意：
1. <Content> 标签中是已完成的草稿片段；
2. <WebSearchContext> 标签中是你检索到的网络数据，请对这些数据进行充分的交叉验证，仅保留可信的信息；
3. 你当前正在撰写的主题为：{task}。
4. 该报告位详细分析报告，内容尽可能详细，不要遗漏任何有效信息。

请基于上述信息撰写一段结构清晰、逻辑严谨、使用正式学术语言且基于证据的研究报告内容，建议使用合适的标题或小标题或章节标号进行组织。不得添加任何输入中未出现的事实或观点。
</Role>

<Content>
{content}
</Content>

<WebSearchContext>
{web_search_context}
</WebSearchContext>
  `;

  const chain = PromptTemplate.fromTemplate(prompt).pipe(llm);

  const response = await chain.invoke({
    task: task ?? "",
    content: (all_sub_reports ?? [])
      .map((report) => `### ${report.title}\n${report.content}`)
      .join("\n\n"),
    web_search_context: (sources ?? [])
      .map((source) => `### ${source.title}\n${source.content}`)
      .join("\n\n"),
  });

  const summaryReport = {
    title: task ?? "",
    content: Array.isArray(response.content)
      ? (response.content[0] as MessageContentText).text
      : (response.content as string),
    sources: sources ?? [],
  };

  return {
    report: summaryReport,
  };
}
