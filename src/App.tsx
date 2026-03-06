import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireRole } from "./routes/RequireRole";

import EnterprisePortal from "./pages/EnterprisePortal";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";

// STATIC IMPORTS to guarantee Vite builds cleanly
import ExecutiveCommandCenter from "./pages/portals/admin/ExecutiveCommandCenter";
import OperationsPortal from "./pages/portals/operations/OperationsPortal";
import FinancePortal from "./pages/portals/finance/FinancePortal";
import ExecutionPortal from "./pages/portals/execution/ExecutionPortal";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#05080F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /></div>}>
          <Router>
            <Routes>
              <Route path="/" element={<EnterprisePortal />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route element={<RequireAuth />}>
                <Route path="/portal/admin/executive" element={
                  <RequireRole allow={["SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutiveCommandCenter />
                  </RequireRole>
                } />
                <Route path="/portal/operations" element={
                  <RequireRole allow={["SUPER_ADMIN", "SYS", "APP_OWNER", "OPERATIONS_ADMIN", "STAFF", "DATA_ENTRY", "SUPERVISOR", "WAREHOUSE_MANAGER", "SUBSTATION_MANAGER", "BRANCH_MANAGER", "ADM", "MGR"]}>
                    <OperationsPortal />
                  </RequireRole>
                } />
                <Route path="/portal/finance" element={
                  <RequireRole allow={["SUPER_ADMIN", "SYS", "APP_OWNER", "FINANCE_USER", "FINANCE_STAFF", "FINANCE_ADMIN", "ACCOUNTANT"]}>
                    <FinancePortal />
                  </RequireRole>
                } />
                <Route path="/portal/execution" element={
                  <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                    <ExecutionPortal />
                  </RequireRole>
                } />
              </Route>

              {/* Catch-all safely hands off to the root router without looping */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  );
}
