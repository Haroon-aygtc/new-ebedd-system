#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Colors for console output
const colors = {
  frontend: "\x1b[36m", // Cyan
  backend: "\x1b[32m", // Green
  reset: "\x1b[0m", // Reset
};

// Function to prefix logs with the service name and color
function prefixLogs(data, prefix, color) {
  const lines = data.toString().trim().split("\n");
  return lines
    .map((line) => `${color}[${prefix}]${colors.reset} ${line}`)
    .join("\n");
}

// Start frontend server
const frontend = spawn("npm", ["run", "dev"], { shell: true });

// Start backend server
const backend = spawn("npm", ["run", "dev:server"], { shell: true });

// Handle frontend output
frontend.stdout.on("data", (data) => {
  console.log(prefixLogs(data, "Frontend", colors.frontend));
});

frontend.stderr.on("data", (data) => {
  console.error(prefixLogs(data, "Frontend", colors.frontend));
});

// Handle backend output
backend.stdout.on("data", (data) => {
  console.log(prefixLogs(data, "Backend", colors.backend));
});

backend.stderr.on("data", (data) => {
  console.error(prefixLogs(data, "Backend", colors.backend));
});

// Handle process exit
frontend.on("close", (code) => {
  console.log(
    `${colors.frontend}[Frontend]${colors.reset} Process exited with code ${code}`,
  );
  backend.kill();
  process.exit(code);
});

backend.on("close", (code) => {
  console.log(
    `${colors.backend}[Backend]${colors.reset} Process exited with code ${code}`,
  );
  frontend.kill();
  process.exit(code);
});

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\nShutting down all servers...");
  frontend.kill();
  backend.kill();
  process.exit(0);
});
