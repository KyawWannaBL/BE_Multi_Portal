#!/usr/bin/env node
/**
 * Adds useful scripts if package.json exists.
 * - patch:tsconfig:aliases
 *
 * Safe: no-ops if package.json is not present.
 */
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(process.cwd(), "package.json");
if (!fs.existsSync(pkgPath)) {
  console.log("[patch-package-json] No package.json found (skipping).");
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["patch:tsconfig:aliases"] = "node scripts/patch-tsconfig-aliases.cjs";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("[patch-package-json] added scripts: patch:tsconfig:aliases");
