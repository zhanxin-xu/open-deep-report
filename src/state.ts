import { Annotation } from "@langchain/langgraph";

export interface Source {
  title: string;
  url: string;
  index: number;
  content: string;
}

export interface SubReport {
  title: string;
  content: string;
  sources: Array<Source>;
}

export const PlanState = Annotation.Root({
  // 用户输入
  user_input: Annotation<string>(),
  // 报告名称
  report_name: Annotation<string>(),
  // 任务列表
  tasks: Annotation<Array<string>>(),
  sub_reports: Annotation<Array<SubReport>>(),
  all_sources: Annotation<Array<Source>>(),
});

export const ExecState = Annotation.Root({
  all_sub_reports: Annotation<Array<SubReport>>(),
  task: Annotation<string>(),
  gaps: Annotation<Array<string>>(),
  report: Annotation<SubReport>(),
  all_sources: Annotation<Array<Source>>(),
});
