import { PlanState } from "../state";

async function plan(
  state: typeof PlanState.State
): Promise<Partial<typeof PlanState.State>> {
  const { user_input, report_name } = state;
  return {
    tasks: [],
    sub_reports: [],
  };
}
