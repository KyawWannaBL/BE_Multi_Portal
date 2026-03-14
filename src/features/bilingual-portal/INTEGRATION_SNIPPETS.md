Manual integration only

1) In src/App.tsx add:
const BilingualPortalRouteMount = React.lazy(() => import("./features/bilingual-portal/routes/RouteMount"));

2) In App() add:
const BILINGUAL_ROLES = Array.from(new Set([...ADMIN_ROLES, ...FINANCE_ROLES, ...OPS_ROLES, ...BRANCH_ROLES, ...MERCHANT_ROLES]));

3) Add this route before the fallback "*" route:
<Route
  path="/portal/bilingual/*"
  element={
    <SecurityGatekeeper allowedRoles={BILINGUAL_ROLES}>
      <BilingualPortalRouteMount />
    </SecurityGatekeeper>
  }
/>

4) In src/components/Header.tsx add:
import LanguageToggle from "@/components/common/LanguageToggle";

5) Add this before <NotificationBell />:
<LanguageToggle />
