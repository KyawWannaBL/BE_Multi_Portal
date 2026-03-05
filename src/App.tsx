import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequireRole } from "@/routes/RequireRole";

import Login from "./pages/Login";
import DashboardRedirect from "./pages/DashboardRedirect";
import WaybillCenterPage from "@/pages/portals/operations/WaybillCenterPage";
import OperationsPortal from "@/pages/portals/OperationsPortal";

export default function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={<div className="bg-[#05080F] min-h-screen" />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/portal/operations" element={<RequireRole allow={["OPERATIONS_ADMIN", "DATA_ENTRY"]}><OperationsPortal /></RequireRole>} />
              <Route path="/portal/operations/waybills" element={<RequireRole allow={["SUPER_ADMIN", "OPERATIONS_ADMIN", "DATA_ENTRY"]}><WaybillCenterPage /></RequireRole>} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </LanguageProvider>
  );
}
