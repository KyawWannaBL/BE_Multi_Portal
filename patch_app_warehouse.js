const fs = require('fs');
const path = 'src/App.tsx';
if (!fs.existsSync(path)) {
  console.log('src/App.tsx not found, skipping patch.');
  process.exit(0);
}
let s = fs.readFileSync(path, 'utf-8');
const routes = `
              <Route path="/portal/warehouse/controller" element={<RequireRole allow={["WAREHOUSE_CONTROLLER","SUPER_ADMIN","APP_OWNER"]}><WarehouseControllerPortal /></RequireRole>} />
              <Route path="/portal/warehouse/staff" element={<RequireRole allow={["WAREHOUSE_STAFF","SUPER_ADMIN","APP_OWNER"]}><WarehouseStaffPortal /></RequireRole>} />
`;
if (!s.includes('/portal/warehouse/controller')) {
  s = s.replace('<Route path="*"', routes + '\n              <Route path="*"');
  fs.writeFileSync(path, s, 'utf-8');
  console.log('✅ App.tsx warehouse routes patched.');
} else {
  console.log('✅ Routes already present.');
}
