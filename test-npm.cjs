const { spawn } = require("child_process");

console.log("Starting npm install...");
const child = spawn("npm.cmd", ["install", "--verbose"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  console.log("Child process exited with code", code);
});

child.on("error", (err) => {
  console.error("Child error:", err);
});
