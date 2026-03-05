\
#!/usr/bin/env node
/**
 * Patch every tsconfig*.json to include:
 * - compilerOptions.baseUrl="."
 * - compilerOptions.paths["@/*"]=["./src/*"]
 *
 * Preserves formatting/comments when `jsonc-parser` is available.
 */
const fs = require("fs");
const path = require("path");

function findTsconfigFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === "node_modules" || e.name.startsWith(".git")) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (/^tsconfig.*\.json$/i.test(e.name)) out.push(full);
    }
  }
  return out;
}

function patchWithJsoncParser(filePath, text) {
  const jsonc = require("jsonc-parser");
  const errors = [];
  const data = jsonc.parse(text, errors, { allowTrailingComma: true });
  if (!data || typeof data !== "object") throw new Error("Invalid JSONC");
  data.compilerOptions = data.compilerOptions || {};
  data.compilerOptions.baseUrl = data.compilerOptions.baseUrl || ".";
  data.compilerOptions.paths = data.compilerOptions.paths || {};
  data.compilerOptions.paths["@/*"] = data.compilerOptions.paths["@/*"] || ["./src/*"];

  // Apply edits to preserve formatting
  const edits = jsonc.modify(text, [], data, {
    formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" },
  });
  return jsonc.applyEdits(text, edits);
}

function stripJsonComments(text) {
  // Best-effort fallback; formatting/comments may be lost.
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function patchFallbackJson(filePath, text) {
  const cleaned = stripJsonComments(text);
  const data = JSON.parse(cleaned);
  data.compilerOptions = data.compilerOptions || {};
  data.compilerOptions.baseUrl = data.compilerOptions.baseUrl || ".";
  data.compilerOptions.paths = data.compilerOptions.paths || {};
  data.compilerOptions.paths["@/*"] = data.compilerOptions.paths["@/*"] || ["./src/*"];
  return JSON.stringify(data, null, 2) + "\n";
}

function main() {
  const rootDir = process.cwd();
  const files = findTsconfigFiles(rootDir);
  if (!files.length) {
    console.log("[patch-tsconfig-aliases] No tsconfig*.json found.");
    process.exit(0);
  }

  let hasJsonc = false;
  try {
    require.resolve("jsonc-parser");
    hasJsonc = true;
  } catch (_) {}

  let changed = 0;
  for (const f of files) {
    const before = fs.readFileSync(f, "utf8");
    const after = hasJsonc ? patchWithJsoncParser(f, before) : patchFallbackJson(f, before);
    if (after !== before) {
      fs.writeFileSync(f, after, "utf8");
      changed++;
      console.log(`[patch-tsconfig-aliases] patched: ${path.relative(rootDir, f)}`);
    }
  }
  console.log(`[patch-tsconfig-aliases] done. changed=${changed}`);
}

main();
