export function getRecentNav() { return []; }
export function addRecentNav() {}
// ✅ Build Fix: PortalSidebar.tsx expects pushRecent
export const pushRecent = (item) => addRecentNav(item);
export function clearRecentNav() {}
