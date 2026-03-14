const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json","utf-8"));
pkg.dependencies = pkg.dependencies || {};
Object.assign(pkg.dependencies, {
  "@zxing/browser": "^0.1.4",
  "tesseract.js": "^5.1.1",
  "xlsx": "^0.18.5",
  "mapbox-gl": "^2.15.0"
});
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
