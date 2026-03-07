const fs = require('fs');
const path = 'src/App.tsx';

if (fs.existsSync(path)) {
  let s = fs.readFileSync(path, 'utf-8');
  if (!s.includes('/portal/execution/intake')) {
    console.log("⚠️ App.tsx exists but route missing. Add manually if needed:");
    console.log('  <Route path="/portal/execution/intake" element={<RequireRole allow={["RIDER","DRIVER","HELPER","SUPER_ADMIN","SYS","APP_OWNER"]}><ExecutionParcelIntakePage /></RequireRole>} />');
  }
} else {
  console.log("⚠️ src/App.tsx not found; add route manually.");
}
