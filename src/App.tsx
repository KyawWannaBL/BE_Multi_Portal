import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireRole } from "./routes/RequireRole";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import DashboardRedirect from "./pages/DashboardRedirect";

// Safe Fallback Components (prevents crashes if portal pages aren't built yet)
const FallbackPortal = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-[#05080F] flex items-center justify-center text-white p-8 text-center">
    <div>
      <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-widest">{title}</h1>
      <p className="text-slate-400 mt-2 text-sm">Portal modules are currently being provisioned.</p>
    </div>
  </div>
);

const ExecutiveCommandCenter = lazy(() => import("./pages/portals/admin/ExecutiveCommandCenter").catch(() => ({ default: () => <FallbackPortal title="Super Admin Dashboard" /> })));
const OperationsPortal = lazy(() => import("./pages/portals/operations/OperationsPortal").catch(() => ({ default: () => <FallbackPortal title="Operations Portal" /> })));
const FinancePortal = lazy(() => import("./pages/portals/finance/FinancePortal").catch(() => ({ default: () => <FallbackPortal title="Finance Portal" /> })));
const ExecutionPortal = lazy(() => import("./pages/portals/execution/ExecutionPortal").catch(() => ({ default: () => <FallbackPortal title="Execution Portal" /> })));

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense fallback={<div className="bg-[#05080F] min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /></div>}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              <Route element={<RequireAuth />}>
                <Route path="/" element={<DashboardRedirect />} />
                <Route path="/portal/admin/executive" element={<RequireRole allow={["SUPER_ADMIN", "SYS", "APP_OWNER"]}><ExecutiveCommandCenter /></RequireRole>} />
                <Route path="/portal/operations" element={<OperationsPortal />} />
                <Route path="/portal/finance" element={<FinancePortal />} />
                <Route path="/portal/execution" element={<ExecutionPortal />} />
              </Route>

              {/* Prevents loop by catching unknown routes and safely sending back to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  );
}
