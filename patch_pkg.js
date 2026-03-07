const fs = require("fs");
const path = "./package.json";
if (!fs.existsSync(path)) {
  console.error("❌ Still cannot find package.json in " + process.cwd());
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(path,"utf-8"));
pkg.dependencies = pkg.dependencies || {};
Object.assign(pkg.dependencies, {
  "@zxing/browser": "^0.1.4",
  "tesseract.js": "^5.1.1",
  "xlsx": "^0.18.5",
  "mapbox-gl": "^2.15.0"
});
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log("✅ package.json patched successfully.");
