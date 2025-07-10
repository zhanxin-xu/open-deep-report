import fs from "fs";
import { SubReport } from "../../state";

const all_reports = JSON.parse(fs.readFileSync("all_reports.json", "utf-8"));

const all_sub_reports = all_reports.all_sub_reports.map(
  (sub_report: SubReport) => {
    return {
      title: sub_report.title.trim(),
      content: sub_report.content.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+/g, " ").replace(/^\s+|\s+$/gm, ""),
    };
  }
);

console.log(JSON.stringify(all_sub_reports, null, 2));
