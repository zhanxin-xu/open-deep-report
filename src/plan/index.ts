import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import z from "zod/v4";
import { getLLm } from "../llm";
import { PlanState } from "../state";

export async function Plan(
  state: Partial<typeof PlanState.State>
): Promise<Partial<typeof PlanState.State>> {
  const { user_input } = state;
  const llm = getLLm();

  const promt = `
<Role>
You are a seasoned researcher and report author. Based on the <UserInput> requirements, complete the following tasks:
1. Extract a precise and engaging report title.
2. Break down the analysis workflow required to complete the report into several research steps (excluding the final report writing).

Strictly follow the JSON structure defined in <OutputSchema>. Return ONLY the JSON, without any additional content.
</Role>
<UserInput>
{user_input}
</UserInput>
<OutputSchema>
{output_schema}
</OutputSchema>
`;

  const outputSchema = z.object({
    report_name: z.string(),
    tasks: z.array(z.string()).max(30)
  });

  const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);
  const prompt = PromptTemplate.fromTemplate(promt);
  const chain = prompt.pipe(llm).pipe(outputParser);
  const response = await chain.invoke({
    user_input: user_input,
    output_schema: outputParser.getFormatInstructions(),
  });
  return {
    tasks: response.tasks,
    report_name: response.report_name,
  };
}
