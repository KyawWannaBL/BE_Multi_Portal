import { Routes, Route, Navigate } from "react-router-dom";
import BilingualPortalScreen from "../components/BilingualPortalScreen";
import { screens } from "../config/screens";

function slugFor(key: string) {
  return key === "merchantAccounts" ? "merchant-accounts" : key;
}

export default function BilingualPortalRouteMount() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="branches" replace />} />
      {screens.map((screen) => (
        <Route
          key={screen.key}
          path={slugFor(screen.key)}
          element={<BilingualPortalScreen screen={screen} />}
        />
      ))}
    </Routes>
  );
}
