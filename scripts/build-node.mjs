#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const env = { ...process.env, NITRO_PRESET: "node-server" };

function run(script, args = []) {
  const result = spawnSync(process.execPath, [join(root, script), ...args], {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`[build:node] ${result.error.message}`);
    return 127;
  }
  return result.status ?? 1;
}

let status = run("scripts/with-app-env.mjs", ["vite", "build"]);
if (status === 0) status = run("scripts/migrate.mjs");
process.exit(status);