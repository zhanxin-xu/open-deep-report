import fs from "fs";
import { SummarizeReport } from "..";
const report = JSON.parse(fs.readFileSync("report.json", "utf-8"));
const sources = report.sources;
const task = "Project Fundamental Analysis: Assess Polkadot's strategic alignment, market size, competitive landscape, team credibility, funding, and community traction.";

(async () => {
  const report = await SummarizeReport({
    all_sub_reports: [],
    sources: sources,
    task: task,
  });
  console.log(report.report?.content);
})();