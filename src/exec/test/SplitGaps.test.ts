import fs from "fs";
import { ExecSearch, SplitGaps, SummarizeReport } from "..";
import { Source } from "../../state";

// SplitGaps({
//   task: "Project Fundamental Analysis: Assess Polkadot's strategic alignment, market size, competitive landscape, team credibility, funding, and community traction.",
//   all_sub_reports: [],
// }).then((res) => {
//   console.log(res);
// });

(async function testSummarizeReport() {
  const task =
    "Conduct a thorough review of SUI's whitepaper and official communications to determine its strategic vision and alignment with current market narratives";
  const gaps: string[] = await SplitGaps({
    task: task,
    all_sub_reports: [],
  }).then((res) => {
    return res.gaps ?? [];
  });
  console.log(gaps);

  let sources: Source[] = [];

  for (const gap of gaps) {
    const search_results = await ExecSearch(gap);
    sources.push(...search_results);
  }

  const report = await SummarizeReport({
    all_sub_reports: [],
    sources: sources,
    task: task,
  }).then((res) => {
    return res.report;
  });
  fs.writeFileSync(
    "report.json",
    JSON.stringify(
      {
        task,
        gaps,
        sources,
        report: report?.content ?? "",
      },
      null,
      2
    )
  );
})();
