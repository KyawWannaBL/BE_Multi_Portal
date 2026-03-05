import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { RequireAuth } from "@/routes/RequireAuth";
import { RequireRole } from "@/routes/RequireRole";

// Layouts & Base Pages
import Login from "./pages/Login";
import WaybillCenterPage from "@/pages/portals/operations/WaybillCenterPage";
import DashboardRedirect from "./pages/DashboardRedirect";
import Unauthorized from "./pages/Unauthorized";

// Enterprise Portals
import AdminPortal from "@/pages/portals/AdminPortal";
import OperationsPortal from "@/pages/portals/OperationsPortal";
import FinancePortal from "@/pages/portals/FinancePortal";
import ExecutionPortal from "@/pages/portals/ExecutionPortal";
import HrPortal from "@/pages/portals/HrPortal";

export default function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={<div className="bg-[#05080F] min-h-screen" />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />
              
              {/* Specialized Role-Based Portals */}
              <Route path="/portal/admin" element={<RequireRole allow={["SUPER_ADMIN", "SYS"]}><AdminPortal /></RequireRole>} />
              <Route path="/portal/operations" element={<RequireRole allow={["STAFF", "OPERATIONS_ADMIN"]}><OperationsPortal /></RequireRole>} />
              <Route path="/portal/finance" element={<RequireRole allow={["FINANCE_USER"]}><FinancePortal /></RequireRole>} />
              <Route path="/portal/execution" element={<RequireRole allow={["RIDER", "DRIVER"]}><ExecutionPortal /></RequireRole>} />
              <Route path="/portal/hr" element={<RequireRole allow={["HR_ADMIN"]}><HrPortal /></RequireRole>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </LanguageProvider>
  );
}
