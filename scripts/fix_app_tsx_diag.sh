#!/usr/bin/env bash
set -euo pipefail

echo "🩹 Fixing App.tsx route syntax + add /diag (EN/MM)"
echo "🩹 App.tsx route syntax ပြင် + /diag ထည့် (EN/MM)"

APP="src/App.tsx"
mkdir -p src

if [ -f "$APP" ]; then
  cp -f "$APP" "${APP}.bak.$(date +%Y%m%d_%H%M%S)" || true
fi

cat > "$APP" <<'EOF'
// @ts-nocheck
/**
 * App Router (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Central route map for Britium L5 multi-portal.
 * MY: Britium L5 multi-portal အတွက် route map စုစည်းရာ။
 */

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuthz } from "./routes/RequireAuthz";

import EnterprisePortal from "./pages/EnterprisePortal";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import DashboardRedirect from "./pages/DashboardRedirect";
import Diagnostics from "./pages/Diagnostics";

// Admin hub
import SuperAdminPortal from "./pages/portals/admin/SuperAdminPortal";
import AdminModuleWrapper from "./pages/portals/admin/AdminModuleWrapper";
import ExecutiveCommandCenter from "./pages/portals/admin/ExecutiveCommandCenter";

// Admin modules
import AccountControl from "./pages/AccountControl";
import AdminDashboard from "./pages/AdminDashboard";
import AuditLogs from "./pages/AuditLogs";
import AdminUsers from "./pages/AdminUsers";
import PermissionAssignment from "./pages/PermissionAssignment";

// Portals (placeholders / real screens)
import AdminPortal from "./pages/portals/AdminPortal";
import OperationsPortal from "./pages/portals/OperationsPortal";
import OperationsTrackingPage from "./pages/portals/OperationsTrackingPage";

import FinancePortal from "./pages/portals/FinancePortal";
import FinanceReconPage from "./pages/portals/finance/FinanceReconPage";

import HrPortal from "./pages/portals/HrPortal";
import HrAdminOpsPage from "./pages/portals/hr/HrAdminOpsPage";

import MarketingPortal from "./pages/portals/MarketingPortal";
import SupportPortal from "./pages/portals/SupportPortal";

import ExecutionPortal from "./pages/portals/ExecutionPortal";
import ExecutionNavigationPage from "./pages/portals/ExecutionNavigationPage";
import ExecutionManualPage from "./pages/portals/execution/ExecutionManualPage";

import WarehousePortal from "./pages/portals/WarehousePortal";
import WarehouseReceivingPage from "./pages/portals/warehouse/WarehouseReceivingPage";
import WarehouseDispatchPage from "./pages/portals/warehouse/WarehouseDispatchPage";

import BranchPortal from "./pages/portals/BranchPortal";
import BranchInboundPage from "./pages/portals/branch/BranchInboundPage";
import BranchOutboundPage from "./pages/portals/branch/BranchOutboundPage";

import SupervisorPortal from "./pages/portals/SupervisorPortal";
import SupervisorApprovalPage from "./pages/portals/supervisor/SupervisorApprovalPage";
import SupervisorFraudPage from "./pages/portals/supervisor/SupervisorFraudPage";

import MerchantPortal from "./pages/portals/MerchantPortal";
import CustomerPortal from "./pages/portals/CustomerPortal";

import DataEntryOpsPage from "./pages/portals/operations/DataEntryOpsPage";
import QROpsScanPage from "./pages/portals/operations/QROpsScanPage";
import WaybillCenterPage from "./pages/portals/operations/WaybillCenterPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
            </div>
          }
        >
          <Router>
            <Routes>
              {/* Public routes (EN/MM) / အများပြည်သူအသုံးပြုနိုင်သော routes */}
              <Route path="/" element={<EnterprisePortal />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/diag" element={<Diagnostics />} />

              {/* Protected routes with RBAC (EN/MM) / ခွင့်ပြုချက်စစ်ပြီး ဝင်မည့် routes */}
              <Route element={<RequireAuthz />}>
                {/* Super Admin Hub */}
                <Route path="/portal/admin" element={<SuperAdminPortal />} />
                <Route path="/portal/admin/executive" element={<ExecutiveCommandCenter />} />

                <Route
                  path="/portal/admin/accounts"
                  element={
                    <AdminModuleWrapper title="Account Control">
                      <AccountControl />
                    </AdminModuleWrapper>
                  }
                />
                <Route
                  path="/portal/admin/dashboard"
                  element={
                    <AdminModuleWrapper title="Admin Dashboard">
                      <AdminDashboard />
                    </AdminModuleWrapper>
                  }
                />
                <Route
                  path="/portal/admin/audit"
                  element={
                    <AdminModuleWrapper title="Audit Logs">
                      <AuditLogs />
                    </AdminModuleWrapper>
                  }
                />
                <Route
                  path="/portal/admin/users"
                  element={
                    <AdminModuleWrapper title="Admin Users">
                      <AdminUsers />
                    </AdminModuleWrapper>
                  }
                />
                <Route
                  path="/portal/admin/permission-assignment"
                  element={
                    <AdminModuleWrapper title="Permission Assignment">
                      <PermissionAssignment />
                    </AdminModuleWrapper>
                  }
                />

                {/* Legacy portal */}
                <Route path="/portal/admin-legacy" element={<AdminPortal />} />

                {/* Operations */}
                <Route path="/portal/operations" element={<OperationsPortal />} />
                <Route path="/portal/operations/manual" element={<DataEntryOpsPage />} />
                <Route path="/portal/operations/qr-scan" element={<QROpsScanPage />} />
                <Route path="/portal/operations/tracking" element={<OperationsTrackingPage />} />
                <Route path="/portal/operations/waybill" element={<WaybillCenterPage />} />

                {/* Finance */}
                <Route path="/portal/finance" element={<FinancePortal />} />
                <Route path="/portal/finance/recon" element={<FinanceReconPage />} />

                {/* Marketing / HR / Support */}
                <Route path="/portal/marketing" element={<MarketingPortal />} />
                <Route path="/portal/hr" element={<HrPortal />} />
                <Route path="/portal/hr/admin" element={<HrAdminOpsPage />} />
                <Route path="/portal/support" element={<SupportPortal />} />

                {/* Execution */}
                <Route path="/portal/execution" element={<ExecutionPortal />} />
                <Route path="/portal/execution/navigation" element={<ExecutionNavigationPage />} />
                <Route path="/portal/execution/manual" element={<ExecutionManualPage />} />

                {/* Warehouse */}
                <Route path="/portal/warehouse" element={<WarehousePortal />} />
                <Route path="/portal/warehouse/receiving" element={<WarehouseReceivingPage />} />
                <Route path="/portal/warehouse/dispatch" element={<WarehouseDispatchPage />} />

                {/* Branch */}
                <Route path="/portal/branch" element={<BranchPortal />} />
                <Route path="/portal/branch/inbound" element={<BranchInboundPage />} />
                <Route path="/portal/branch/outbound" element={<BranchOutboundPage />} />

                {/* Supervisor */}
                <Route path="/portal/supervisor" element={<SupervisorPortal />} />
                <Route path="/portal/supervisor/approval" element={<SupervisorApprovalPage />} />
                <Route path="/portal/supervisor/fraud" element={<SupervisorFraudPage />} />

                {/* Merchant / Customer */}
                <Route path="/portal/merchant" element={<MerchantPortal />} />
                <Route path="/portal/customer" element={<CustomerPortal />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  );
}
EOF

echo "✅ App.tsx rewritten cleanly."
echo "Next:"
echo "  npm run build"
echo "  git add src/App.tsx"
echo "  git commit -m \"fix(app): repair routes + add diag\""
echo "  git push"
