import OperationsTrackingPage from "./pages/portals/OperationsTrackingPage";
import ExecutionNavigationPage from "./pages/portals/ExecutionNavigationPage";
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";

import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AccountControl from "./pages/AccountControl";
import HRPortal from "./pages/HRPortal";

import { RequireAuth } from "@/routes/RequireAuth";
import { RequireRole } from "@/routes/RequireRole";

// Portals (enterprise entrypoints)
import AdminPortal from "@/pages/portals/AdminPortal";
import OperationsPortal from "@/pages/portals/OperationsPortal";
import FinancePortal from "@/pages/portals/FinancePortal";
import MarketingPortal from "@/pages/portals/MarketingPortal";
import HrPortal from "@/pages/portals/HrPortal";
import SupportPortal from "@/pages/portals/SupportPortal";
import SupervisorPortal from "@/pages/portals/SupervisorPortal";
import WarehousePortal from "@/pages/portals/WarehousePortal";
import BranchPortal from "@/pages/portals/BranchPortal";
import ExecutionPortal from "@/pages/portals/ExecutionPortal";
import MerchantPortal from "@/pages/portals/MerchantPortal";
import CustomerPortal from "@/pages/portals/CustomerPortal";
import ManualPage from "@/pages/ManualPage";

import QROpsScanPage from "@/pages/portals/operations/QROpsScanPage";
import DataEntryOpsPage from "@/pages/portals/operations/DataEntryOpsPage";
import WarehouseReceivingPage from "@/pages/portals/warehouse/WarehouseReceivingPage";
import WarehouseDispatchPage from "@/pages/portals/warehouse/WarehouseDispatchPage";
import SupervisorFraudPage from "@/pages/portals/supervisor/SupervisorFraudPage";
import FinanceReconPage from "@/pages/portals/finance/FinanceReconPage";
import HrAdminOpsPage from "@/pages/portals/hr/HrAdminOpsPage";
import BranchInboundPage from "@/pages/portals/branch/BranchInboundPage";
import BranchOutboundPage from "@/pages/portals/branch/BranchOutboundPage";

// Existing modules (admin deep UI)
import ShipmentControl from "./pages/ShipmentControl";
import FleetCommand from "./pages/FleetCommand";
import OmniFinance from "./pages/OmniFinance";
import LiveMap from "./pages/LiveMap";
import SystemTariffs from "./pages/SystemTariffs";

const Loading = () => {
  const { lang } = useLanguage();
  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center font-mono text-emerald-500">
      <div className="animate-pulse uppercase tracking-widest text-[10px]">
        {lang === "en" ? "INITIALIZING L5 SECURE GATEWAY..." : "L5 လုံခြုံရေးဂိတ်ကို စတင်နေပါသည်..."}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <Suspense fallback={<Loading />}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<DashboardRedirect />} />

              {/* Enterprise portal entrypoints */}
              <Route path="/portal/admin" element={
                <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A"]}>
                  <AdminPortal />
                </RequireRole>
              } />

              <Route path="/portal/operations" element={
                <RequireRole allow={["OPERATIONS_ADMIN", "STAFF", "DATA_ENTRY", "ADM", "MGR", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <OperationsPortal />
                </RequireRole>
              } />

              <Route path="/portal/operations/manual" element={
                <RequireRole allow={["OPERATIONS_ADMIN", "STAFF", "DATA_ENTRY", "SUPERVISOR", "WAREHOUSE_MANAGER", "SUBSTATION_MANAGER", "RIDER", "DRIVER", "HELPER", "ADM", "MGR", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <ManualPage />
                </RequireRole>
              } />

              <Route path="/portal/execution/manual" element={
                <RequireRole allow={["RIDER", "DRIVER", "HELPER"]}>
                  <ManualPage />
                </RequireRole>
              } />
              
              <Route path="/portal/finance" element={
                <RequireRole allow={["FINANCE_USER", "FINANCE_STAFF", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <FinancePortal />
                </RequireRole>
              } />

              <Route path="/portal/marketing" element={
                <RequireRole allow={["MARKETING_ADMIN", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <MarketingPortal />
                </RequireRole>
              } />

              <Route path="/portal/hr" element={
                <RequireRole allow={["HR_ADMIN", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <HrPortal />
                </RequireRole>
              } />

              <Route path="/portal/support" element={
                <RequireRole allow={["CUSTOMER_SERVICE", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <SupportPortal />
                </RequireRole>
              } />

              <Route path="/portal/supervisor" element={
                <RequireRole allow={["SUPERVISOR", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <SupervisorPortal />
                </RequireRole>
              } />

              <Route path="/portal/warehouse" element={
                <RequireRole allow={["WAREHOUSE_MANAGER", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <WarehousePortal />
                </RequireRole>
              } />

              <Route path="/portal/branch" element={
                <RequireRole allow={["SUBSTATION_MANAGER", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <BranchPortal />
                </RequireRole>
              } />

              <Route path="/portal/execution" element={
                <RequireRole allow={["RIDER", "DRIVER", "HELPER", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <ExecutionPortal />
                </RequireRole>
              } />

              <Route path="/portal/merchant" element={
                <RequireRole allow={["MERCHANT", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <MerchantPortal />
                </RequireRole>
              } />

              <Route path="/portal/customer" element={
                <RequireRole allow={["CUSTOMER", "SYS", "APP_OWNER", "SUPER_ADMIN"]}>
                  <CustomerPortal />
                </RequireRole>
              } />

              {/* Legacy admin route */}
              <Route path="/admin" element={
                <RequireRole allow={["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "MGR", "ADM"]}>
                  <AdminLayout />
                </RequireRole>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="approvals" element={<AccountControl />} />
                <Route path="accounts" element={<AccountControl />} />
                <Route path="hr" element={<HRPortal />} />
                <Route path="shipments" element={<ShipmentControl />} />
                <Route path="fleet" element={<FleetCommand />} />
                <Route path="omni-finance" element={<OmniFinance />} />
                <Route path="live-map" element={<LiveMap />} />
                <Route path="settings" element={<SystemTariffs />} />
              </Route>
              <Route
                path="/portal/operations/tracking"
                element={
                  <RequireRole allow={["OPERATIONS_ADMIN","STAFF","SUPERVISOR","WAREHOUSE_MANAGER","SUBSTATION_MANAGER","BRANCH_MANAGER","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <OperationsTrackingPage />
                  </RequireRole>
                }
              />
              <Route
                path="/portal/execution/navigation"
                element={
                  <RequireRole allow={["RIDER","DRIVER","HELPER","SYS","APP_OWNER","SUPER_ADMIN"]}>
                    <ExecutionNavigationPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/operations/qr-scan"
                element={
                  <RequireRole allow={["OPERATIONS_ADMIN","STAFF","DATA_ENTRY","SUPERVISOR","WAREHOUSE_MANAGER","SUBSTATION_MANAGER","BRANCH_MANAGER","RIDER","DRIVER","HELPER","FINANCE_USER","FINANCE_STAFF","HR_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <QROpsScanPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/operations/data-entry"
                element={
                  <RequireRole allow={["DATA_ENTRY","OPERATIONS_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <DataEntryOpsPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/warehouse/receiving"
                element={
                  <RequireRole allow={["WAREHOUSE_MANAGER","OPERATIONS_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <WarehouseReceivingPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/warehouse/dispatch"
                element={
                  <RequireRole allow={["WAREHOUSE_MANAGER","OPERATIONS_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <WarehouseDispatchPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/supervisor/fraud"
                element={
                  <RequireRole allow={["SUPERVISOR","OPERATIONS_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <SupervisorFraudPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/finance/reconcile"
                element={
                  <RequireRole allow={["FINANCE_USER","FINANCE_STAFF","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <FinanceReconPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/hr/admin"
                element={
                  <RequireRole allow={["HR_ADMIN","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <HrAdminOpsPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/branch/inbound"
                element={
                  <RequireRole allow={["SUBSTATION_MANAGER","BRANCH_MANAGER","OPERATIONS_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <BranchInboundPage />
                  </RequireRole>
                }
              />

              <Route
                path="/portal/branch/outbound"
                element={
                  <RequireRole allow={["SUBSTATION_MANAGER","BRANCH_MANAGER","OPERATIONS_ADMIN","ADM","MGR","SUPER_ADMIN","SYS","APP_OWNER"]}>
                    <BranchOutboundPage />
                  </RequireRole>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Suspense>
    </LanguageProvider>
  );
}