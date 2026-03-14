import "leaflet/dist/leaflet.css";
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SecurityGatekeeper } from "./components/auth/SecurityGatekeeper";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

// EN: Lazy-loaded pages
// MM: Lazy-loaded page များ
const ForcePasswordReset = React.lazy(() => import("./pages/auth/ForcePasswordReset"));
const ForgotPassword = React.lazy(() => import("./pages/auth/ForgotPassword"));
const Login = React.lazy(() => import("./pages/auth/Login"));

const SuperAdminDashboard = React.lazy(() => import("./pages/portals/admin/SuperAdminDashboard"));
const FinanceDashboard = React.lazy(() => import("./pages/portals/finance/OmniFinancialDashboard"));
const SupervisorDashboard = React.lazy(() => import("./pages/portals/supervisor/SupervisorDashboard"));
const DataEntryDashboard = React.lazy(() => import("./pages/portals/data-entry/DataEntryDashboard"));
const ExecutionPortal = React.lazy(() => import("./pages/portals/execution/ExecutionPortal"));
const MerchantDashboard = React.lazy(() => import("./pages/portals/merchant/MerchantDashboard"));
const WarehouseDashboard = React.lazy(() => import("./pages/portals/warehouse/WarehouseDashboard"));
const HrDashboard = React.lazy(() => import("./pages/portals/hr/HrDashboard"));
const SupportDashboard = React.lazy(() => import("./pages/portals/support/SupportDashboard"));
const CustomerDashboard = React.lazy(() => import("./pages/portals/customer/CustomerDashboard"));
const BranchDashboard = React.lazy(() => import("./pages/portals/branch/BranchDashboard"));
const OperationsDashboard = React.lazy(() => import("./pages/portals/operations/OperationsDashboard"));
const StaffDashboard = React.lazy(() => import("./pages/portals/staff/StaffDashboard"));

const Loading = () => (
  <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
  </div>
);

export default function App() {
  // EN: Master role groups
  // MM: Master role group များ
  const ADMIN_ROLES = ["SUPER_ADMIN", "SYS", "APP_OWNER"];
  const FINANCE_ROLES = [...ADMIN_ROLES, "FINANCE", "FINANCE_ADMIN", "ACCOUNTANT"];
  const HR_ROLES = [...ADMIN_ROLES, "HR", "HR_ADMIN", "HR_DIRECTOR"];
  const OPS_ROLES = [...ADMIN_ROLES, "SUPERVISOR", "HUB_MANAGER", "OPERATIONS_ADMIN", "OPS"];
  const WH_ROLES = [...ADMIN_ROLES, "WAREHOUSE", "WAREHOUSE_MANAGER", "INVENTORY"];
  const BRANCH_ROLES = [...ADMIN_ROLES, "BRANCH_MANAGER", "BRANCH_STAFF"];
  const STAFF_ROLES = [...ADMIN_ROLES, "STAFF", "CLERK"];
  const MERCHANT_ROLES = [...ADMIN_ROLES, "MERCHANT"];
  const EXECUTION_ROLES = [...ADMIN_ROLES, "RIDER", "DRIVER", "HELPER"];
  const DATA_ENTRY_ROLES = [...ADMIN_ROLES, "DATA_ENTRY", "CLERK"];
  const SUPPORT_ROLES = [...ADMIN_ROLES, "SUPPORT", "CS_AGENT"];

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* EN: Forgot password request page
                  MM: Password reset link တောင်းရန် page */}
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* EN: Dedicated password reset landing page
                  MM: Password reset link ဝင်လာမည့် dedicated page */}
              <Route path="/auth/reset-password" element={<ForcePasswordReset />} />

              <Route
                path="/portal/admin/*"
                element={
                  <SecurityGatekeeper allowedRoles={ADMIN_ROLES}>
                    <SuperAdminDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/finance/*"
                element={
                  <SecurityGatekeeper allowedRoles={FINANCE_ROLES}>
                    <FinanceDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/hr/*"
                element={
                  <SecurityGatekeeper allowedRoles={HR_ROLES}>
                    <HrDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/operations/*"
                element={
                  <SecurityGatekeeper allowedRoles={OPS_ROLES}>
                    <OperationsDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/supervisor/*"
                element={
                  <SecurityGatekeeper allowedRoles={OPS_ROLES}>
                    <SupervisorDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/warehouse/*"
                element={
                  <SecurityGatekeeper allowedRoles={WH_ROLES}>
                    <WarehouseDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/branch/*"
                element={
                  <SecurityGatekeeper allowedRoles={BRANCH_ROLES}>
                    <BranchDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/merchant/*"
                element={
                  <SecurityGatekeeper allowedRoles={MERCHANT_ROLES}>
                    <MerchantDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/execution/*"
                element={
                  <SecurityGatekeeper allowedRoles={EXECUTION_ROLES}>
                    <ExecutionPortal />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/data-entry/*"
                element={
                  <SecurityGatekeeper allowedRoles={DATA_ENTRY_ROLES}>
                    <DataEntryDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/staff/*"
                element={
                  <SecurityGatekeeper allowedRoles={STAFF_ROLES}>
                    <StaffDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route
                path="/portal/support/*"
                element={
                  <SecurityGatekeeper allowedRoles={SUPPORT_ROLES}>
                    <SupportDashboard />
                  </SecurityGatekeeper>
                }
              />
              <Route path="/portal/customer/*" element={<CustomerDashboard />} />

              {/* EN: Fallback
                  MM: မသိသော route များကို login သို့ပြန်ပို့ */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
