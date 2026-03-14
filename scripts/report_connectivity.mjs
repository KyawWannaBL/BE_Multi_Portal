import fs from "fs";
import path from "path";

const root = process.cwd();
const srcDir = path.join(root, "src");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
      out.push(...walk(p));
    } else if (entry.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
      out.push(p);
    }
  }
  return out;
}

function read(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

const files = fs.existsSync(srcDir) ? walk(srcDir) : [];

let onClicks = 0;
let fromCalls = 0;
let rpcCalls = 0;
let channelCalls = 0;

const tables = new Map();
const channels = new Map();

for (const f of files) {
  const s = read(f);
  onClicks += (s.match(/onClick\s*=/g) || []).length;
  fromCalls += (s.match(/supabase\.from\s*\(/g) || []).length;
  rpcCalls += (s.match(/supabase\.rpc\s*\(/g) || []).length;
  channelCalls += (s.match(/supabase\.channel\s*\(/g) || []).length;

  for (const m of s.matchAll(/supabase\.from\s*\(\s*["'`](.+?)["'`]\s*\)/g)) {
    tables.set(m[1], (tables.get(m[1]) || 0) + 1);
  }
  for (const m of s.matchAll(/supabase\.channel\s*\(\s*["'`](.+?)["'`]\s*\)/g)) {
    channels.set(m[1], (channels.get(m[1]) || 0) + 1);
  }
}

const tableList = [...tables.entries()].sort((a, b) => b[1] - a[1]);
const channelList = [...channels.entries()].sort((a, b) => b[1] - a[1]);

const md = `# Connectivity Report

## Counts
- TS/TSX files scanned: **${files.length}**
- onClick handlers: **${onClicks}**
- supabase.from(...) calls: **${fromCalls}**
- supabase.rpc(...) calls: **${rpcCalls}**
- supabase.channel(...) calls: **${channelCalls}**

## Supabase Tables Used
${tableList.length ? tableList.map(([t, n]) => `- ${t}: ${n}`).join("\n") : "- (none)"}

## Realtime Channels Used
${channelList.length ? channelList.map(([c, n]) => `- ${c}: ${n}`).join("\n") : "- (none)"}
`;

fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs", "CONNECTIVITY_REPORT.md"), md, "utf8");
console.log("Wrote docs/CONNECTIVITY_REPORT.md");
