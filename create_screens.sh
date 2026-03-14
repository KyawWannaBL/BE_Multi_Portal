#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Creating bilingual placeholder screens... / Bilingual စာမျက်နှာများ ဖန်တီးနေသည်..."

# Array of all required portal files
FILES=(
  "src/pages/AdminDashboard.tsx"
  "src/pages/AuditLogs.tsx"
  "src/pages/AdminUsers.tsx"
  "src/pages/PermissionAssignment.tsx"
  "src/pages/portals/AdminPortal.tsx"
  "src/pages/portals/OperationsPortal.tsx"
  "src/pages/portals/OperationsTrackingPage.tsx"
  "src/pages/portals/FinancePortal.tsx"
  "src/pages/portals/finance/FinanceReconPage.tsx"
  "src/pages/portals/HrPortal.tsx"
  "src/pages/portals/hr/HrAdminOpsPage.tsx"
  "src/pages/portals/MarketingPortal.tsx"
  "src/pages/portals/SupportPortal.tsx"
  "src/pages/portals/ExecutionPortal.tsx"
  "src/pages/portals/ExecutionNavigationPage.tsx"
  "src/pages/portals/execution/ExecutionManualPage.tsx"
  "src/pages/portals/WarehousePortal.tsx"
  "src/pages/portals/warehouse/WarehouseReceivingPage.tsx"
  "src/pages/portals/warehouse/WarehouseDispatchPage.tsx"
  "src/pages/portals/BranchPortal.tsx"
  "src/pages/portals/branch/BranchInboundPage.tsx"
  "src/pages/portals/branch/BranchOutboundPage.tsx"
  "src/pages/portals/SupervisorPortal.tsx"
  "src/pages/portals/supervisor/SupervisorApprovalPage.tsx"
  "src/pages/portals/supervisor/SupervisorFraudPage.tsx"
  "src/pages/portals/MerchantPortal.tsx"
  "src/pages/portals/CustomerPortal.tsx"
  "src/pages/portals/operations/DataEntryOpsPage.tsx"
  "src/pages/portals/operations/QROpsScanPage.tsx"
  "src/pages/portals/operations/WaybillCenterPage.tsx"
)

for FILE in "${FILES[@]}"; do
  # Create directory if it doesn't exist
  mkdir -p "$(dirname "$FILE")"

  # Extract Component Name (e.g., AdminDashboard)
  COMP_NAME=$(basename "$FILE" .tsx | tr -d '-' | tr -d '.')

  # Generate File
  cat > "$FILE" <<EOF
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ${COMP_NAME}() {
  const { lang } = useLanguage();
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <div className="max-w-lg w-full rounded-[2rem] border border-white/10 bg-[#0B101B] p-10 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-500/20 blur-3xl rounded-full opacity-50 pointer-events-none" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-black/40 border border-white/10 relative z-10 shadow-inner">
           <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
           </svg>
        </div>

        <div className="relative z-10 space-y-2">
          <h1 className="text-xl font-black text-white uppercase tracking-widest">
            {t("Module Initializing", "Module ပြင်ဆင်နေသည်")}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed px-4">
            {t(
              "This screen is currently being provisioned for production. The full feature set will be deployed shortly.",
              "ဤစာမျက်နှာကို Production အတွက် ပြင်ဆင်နေပါသည်။ လုပ်ဆောင်ချက်အပြည့်အစုံကို မကြာမီ ထည့်သွင်းပေးပါမည်။"
            )}
          </p>
        </div>

        <div className="mt-8 inline-block rounded-xl bg-black/50 border border-white/5 px-4 py-2 text-[10px] font-mono text-slate-500 relative z-10 shadow-inner">
          FILE: ${FILE}
        </div>
      </div>
    </div>
  );
}
EOF
  echo "✅ Created: $FILE"
done

echo "🎉 All bilingual screens successfully generated! / စာမျက်နှာအားလုံး အောင်မြင်စွာ ဖန်တီးပြီးပါပြီ။"