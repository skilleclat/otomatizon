const sucrase = require("sucrase");
const fs = require("fs");
const path = require("path");

const patternsCode = sucrase.transform(
  fs.readFileSync("src/lib/decision-engine/patterns.ts", "utf8"),
  { transforms: ["typescript", "imports"] }
).code;

const engineCode = sucrase.transform(
  fs.readFileSync("src/lib/decision-engine/engine.ts", "utf8"),
  { transforms: ["typescript", "imports"] }
).code;

fs.writeFileSync("src/lib/decision-engine/patterns.cjs", patternsCode);
fs.writeFileSync("src/lib/decision-engine/engine.cjs", engineCode.replace('./patterns', './patterns.cjs'));
console.log("Transpiled decision-engine files successfully!");
