import { RouteObject } from "react-router-dom";
import { screens } from "../config/screens";
import BilingualPortalScreen from "../components/BilingualPortalScreen";

function slugFor(key: string) {
  return key === "merchantAccounts" ? "merchant-accounts" : key;
}

export function buildBilingualPortalRoutes(): RouteObject[] {
  return screens.map((screen) => ({
    path: `/portal/bilingual/${slugFor(screen.key)}`,
    element: <BilingualPortalScreen screen={screen} />
  }));
}
