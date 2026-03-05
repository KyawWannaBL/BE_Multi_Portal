import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPORT_DIR = path.resolve("reports");
const RAW_LOG = path.join(REPORT_DIR, "full-build-raw.log");
const JSON_OUT = path.join(REPORT_DIR, "full-build-report.json");
const TXT_OUT = path.join(REPORT_DIR, "full-build-missing.txt");

const uniqSort = (a) => Array.from(new Set(a)).sort((x, y) => x.localeCompare(y));
const classify = (m) => (m.startsWith("@/") || m.startsWith("./") || m.startsWith("../") ? "local" : "external");

const parseMissing = (log) => {
  const out = [];
  for (const m of log.matchAll(/TS2307:\s+Cannot find module ['"]([^'"]+)['"]/g)) out.push(m[1]);
  for (const m of log.matchAll(/TS2688:\s+Cannot find type definition file for ['"]([^'"]+)['"]/g)) out.push(`@types/${m[1]}`);
  return out;
};

async function run() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawn(cmd, ["tsc", "-b", "--pretty", "false"], { stdio: ["ignore", "pipe", "pipe"] });

  let log = "";
  child.stdout.on("data", (d) => (log += d.toString()));
  child.stderr.on("data", (d) => (log += d.toString()));

  const exitCode = await new Promise((r) => child.on("close", r));
  fs.writeFileSync(RAW_LOG, log, "utf8");

  const missing = parseMissing(log);
  const external = uniqSort(missing.filter((m) => classify(m) === "external"));
  const local = uniqSort(missing.filter((m) => classify(m) === "local"));

  const report = {
    generatedAt: new Date().toISOString(),
    exitCode,
    missing: { external, local, total: external.length + local.length },
    outputs: {
      rawLog: path.relative(process.cwd(), RAW_LOG),
      json: path.relative(process.cwd(), JSON_OUT),
      txt: path.relative(process.cwd(), TXT_OUT)
    }
  };

  fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(
    TXT_OUT,
    [
      `Exit code: ${exitCode}`,
      "",
      `Missing external (${external.length}):`,
      ...external.map((m) => `  - ${m}`),
      "",
      `Missing local (${local.length}):`,
      ...local.map((m) => `  - ${m}`),
      "",
      `Raw log: ${report.outputs.rawLog}`,
      `JSON report: ${report.outputs.json}`
    ].join("\n") + "\n",
    "utf8"
  );

  console.log(`Wrote ${report.outputs.txt}`);
  process.exit(typeof exitCode === "number" ? exitCode : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
