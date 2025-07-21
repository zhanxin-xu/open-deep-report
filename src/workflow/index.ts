import { START, END, StateGraph, Annotation } from "@langchain/langgraph";
import { Plan } from "../plan";
import { SplitGaps, ExecSearch, SummarizeReport } from "../exec";
import { Source, SubReport } from "../state";

/**
 * Report generation workflow state definition.
 */
export const ReportState = Annotation.Root({
  // === Planning phase ===
  user_input: Annotation<string>(),
  report_name: Annotation<string>(),
  tasks: Annotation<Array<string>>(),

  // === Task iteration bookkeeping ===
  task_index: Annotation<number>({
    reducer: (_prev, next) => next,
  }),
  task: Annotation<string>({
    reducer: (_prev, next) => next,
  }),

  // === Execution phase ===
  gaps: Annotation<Array<string>>({
    reducer: (_prev, next) => next,
  }),
  sources: Annotation<Array<Source>>({
    reducer: (_prev, next) => next,
  }),
  // current_report is omitted as it's not required outside summarize step

  // === Aggregated results ===
  sub_reports: Annotation<Array<SubReport>>({
    reducer: (prev = [], next = []) => prev.concat(next),
  }),
  all_sources: Annotation<Array<Source>>({
    reducer: (prev = [], next = []) => prev.concat(next),
  }),
});

// ----------------------
// Node implementations
// ----------------------

/**
 * Plan the overall report – extract report title and individual tasks.
 */
const planNode = async (
  state: Partial<typeof ReportState.State>
): Promise<Partial<typeof ReportState.State>> => {
  const { tasks, report_name } = await Plan({
    user_input: state.user_input,
  });
  return {
    tasks,
    report_name,
    task_index: 0,
    sub_reports: [],
    all_sources: [],
  };
};

/**
 * Select the current task based on `task_index`.
 */
const selectTaskNode = async (
  state: Partial<typeof ReportState.State>
): Promise<Partial<typeof ReportState.State>> => {
  const { tasks = [], task_index = 0 } = state;
  return {
    task: tasks[task_index],
  };
};

/**
 * Split current task into search gaps.
 */
const splitGapsNode = async (
  state: Partial<typeof ReportState.State>
): Promise<Partial<typeof ReportState.State>> => {
  return await SplitGaps({
    task: state.task,
    all_sub_reports: state.sub_reports,
  });
};

/**
 * Execute search for all gaps and collect sources.
 */
const execSearchNode = async (
  state: Partial<typeof ReportState.State>
): Promise<Partial<typeof ReportState.State>> => {
  const { gaps = [] } = state;
  const allGapSources: Source[] = [];
  for (const gap of gaps) {
    const gapSources = await ExecSearch(gap);
    allGapSources.push(...gapSources);
  }
  return {
    sources: allGapSources,
    all_sources: allGapSources,
  };
};

/**
 * Summarize current task using gathered sources and existing sub-reports.
 */
const summarizeNode = async (
  state: Partial<typeof ReportState.State>
): Promise<Partial<typeof ReportState.State>> => {
  const { report } = await SummarizeReport({
    task: state.task,
    all_sub_reports: state.sub_reports,
    sources: state.sources,
  });
  return {
    sub_reports: report ? [report] : [],
  };
};

/**
 * Increment task index in preparation for next iteration.
 */
const incrementIndexNode = async (
  state: Partial<typeof ReportState.State>
): Promise<Partial<typeof ReportState.State>> => {
  const nextIndex = (state.task_index ?? 0) + 1;
  return {
    task_index: nextIndex,
  };
};

// ----------------------
// Build the graph
// ----------------------

const builder = new StateGraph(ReportState)
  // Register nodes
  .addNode("plan", planNode)
  .addNode("select_task", selectTaskNode)
  .addNode("split_gaps", splitGapsNode)
  .addNode("exec_search", execSearchNode)
  .addNode("summarize", summarizeNode)
  .addNode("increment_index", incrementIndexNode)

  // Define static edges (linear flow)
  .addEdge(START, "plan")
  .addEdge("plan", "select_task")
  .addEdge("select_task", "split_gaps")
  .addEdge("split_gaps", "exec_search")
  .addEdge("exec_search", "summarize")
  .addEdge("summarize", "increment_index")

  // Conditionally continue or finish after incrementing index
  .addConditionalEdges(
    "increment_index",
    (state: typeof ReportState.State) => {
      const { tasks = [], task_index = 0 } = state;
      return task_index < tasks.length ? "continue" : "finished";
    },
    {
      continue: "select_task",
      finished: END,
    }
  );

// Compile the graph – exported for external use
export const reportWorkflow = builder.compile();

/**
 * Helper function for synchronous invocation (collect full state at END).
 */
export async function generateReport(userInput: string) {
  const finalState = await reportWorkflow.invoke({
    user_input: userInput,
  });

  return {
    report_name: finalState.report_name,
    sub_reports: finalState.sub_reports,
    all_sources_count: finalState.all_sources?.length ?? 0,
  };
} 