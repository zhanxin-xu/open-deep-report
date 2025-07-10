import { ExecSearch } from "..";

ExecSearch(
  "What is Polkadot's strategic alignment and overall vision?"
).then((res) => {
  console.log(JSON.stringify(res, null, 2));
});
