import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireRole } from "./routes/RequireRole";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import DashboardRedirect from "./pages/DashboardRedirect";

// STATIC IMPORTS (Prevents white-screen crash from failed lazy loading)
import ExecutiveCommandCenter from "./pages/portals/admin/ExecutiveCommandCenter";
import OperationsPortal from "./pages/portals/operations/OperationsPortal";
import FinancePortal from "./pages/portals/finance/FinancePortal";
import ExecutionPortal from "./pages/portals/execution/ExecutionPortal";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/portal/admin/executive" element={
                <RequireRole allow={["SUPER_ADMIN", "SYS", "APP_OWNER"]}>
                  <ExecutiveCommandCenter />
                </RequireRole>
              } />
              <Route path="/portal/operations" element={<OperationsPortal />} />
              <Route path="/portal/finance" element={<FinancePortal />} />
              <Route path="/portal/execution" element={<ExecutionPortal />} />
            </Route>

            {/* Catch-all safely hands off to the root router without looping */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
