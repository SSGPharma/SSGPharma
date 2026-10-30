// eslint-disable-next-line @typescript-eslint/no-require-imports -- PM2 loads this CommonJS config directly
const fs = require("node:fs");
const envPath = "/srv/ssgpharma/shared/.env";
function readEnv(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing shared environment file: ${file}`);
  const result = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2] || "";
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, "");
    result[match[1]] = value;
  }
  return result;
}
module.exports = {
  apps: [{
    name: "ssgpharma",
    cwd: "/srv/ssgpharma/current",
    script: "server.js",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    restart_delay: 3000,
    max_memory_restart: "700M",
    env: { ...readEnv(envPath), NODE_ENV: "production", PORT: "3000", HOSTNAME: "127.0.0.1" },
  }],
};
