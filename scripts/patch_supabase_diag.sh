#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Patching Supabase diagnostics (EN/MM)"
echo "🧪 Supabase စမ်းသပ်မှု (diagnostics) ထည့်နေသည် (EN/MM)"

SUPA="src/lib/supabase.ts"
APP="src/App.tsx"
DIAG="src/pages/Diagnostics.tsx"

mkdir -p src/lib src/pages

if [ ! -f "$SUPA" ]; then
  echo "❌ Missing $SUPA . Run your Supabase connect script first."
  exit 1
fi

# -----------------------------------------------------------------------------
# 1) Patch src/lib/supabase.ts to expose window.__SUPABASE_SELFTEST__
# -----------------------------------------------------------------------------
if ! grep -q "__SUPABASE_SELFTEST__" "$SUPA"; then
  cp -f "$SUPA" "${SUPA}.bak.$(date +%Y%m%d_%H%M%S)" || true

  cat >> "$SUPA" <<'EOF'

/**
 * DevTools Diagnostics Hook (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Use in browser console:  await window.__SUPABASE_SELFTEST__()
 * MY: Browser console မှာ:     await window.__SUPABASE_SELFTEST__() လို့ စမ်းပါ။
 */
// @ts-ignore
if (typeof window !== "undefined") {
  // @ts-ignore
  window.__SUPABASE_SELFTEST__ = async () => {
    const r = await supabaseSelfTest();
    // @ts-ignore
    console.log("[SUPABASE_URL]", (import.meta?.env?.VITE_SUPABASE_URL || import.meta?.env?.VITE_SUPABASE_PROJECT_URL || "MISSING"));
    // @ts-ignore
    console.log("[SUPABASE_CONFIGURED]", SUPABASE_CONFIGURED, r);
    return r;
  };
}
EOF

  echo "✅ Patched: $SUPA (added window.__SUPABASE_SELFTEST__)"
else
  echo "ℹ️ $SUPA already exposes __SUPABASE_SELFTEST__"
fi

# -----------------------------------------------------------------------------
# 2) Create Diagnostics page /diag (shows URL + configured + session)
# -----------------------------------------------------------------------------
cat > "$DIAG" <<'EOF'
// @ts-nocheck
import React from "react";
import { supabaseSelfTest, SUPABASE_CONFIGURED } from "@/lib/supabase";

export default function Diagnostics() {
  const [res, setRes] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const supaUrl =
    (import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_PROJECT_URL ||
      "MISSING") as string;

  const t = (en: string, mm: string) => en + " / " + mm;

  async function run() {
    setLoading(true);
    try {
      const r = await supabaseSelfTest();
      setRes(r);
      // also expose to window for quick access
      // @ts-ignore
      if (typeof window !== "undefined") window.__LAST_SUPABASE_TEST__ = r;
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void run();
  }, []);

  return (
    <div className="min-h-screen bg-[#05080F] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-black tracking-widest uppercase">
          {t("Diagnostics", "စမ်းသပ်မှု")}
        </h1>

        <div className="rounded-2xl border border-white/10 bg-[#0B101B] p-5">
          <div className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-2">
            {t("Supabase Config", "Supabase ပြင်ဆင်မှု")}
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">{t("Configured", "ချိတ်ပြီး")}:</span>{" "}
              <span className={SUPABASE_CONFIGURED ? "text-emerald-400" : "text-rose-400"}>
                {String(SUPABASE_CONFIGURED)}
              </span>
            </div>

            <div className="break-all">
              <span className="text-slate-400">{t("Supabase URL", "Supabase URL")}:</span>{" "}
              <span className="text-slate-200">{supaUrl}</span>
            </div>

            <div>
              <button
                onClick={run}
                disabled={loading}
                className="mt-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black tracking-widest uppercase"
              >
                {loading ? t("Testing…", "စမ်းနေသည်…") : t("Run Test", "စမ်းမည်")}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B101B] p-5">
          <div className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-2">
            {t("Result", "ရလဒ်")}
          </div>
          <pre className="text-[12px] whitespace-pre-wrap bg-black/40 border border-white/10 rounded-xl p-4 overflow-auto">
            {JSON.stringify(res, null, 2)}
          </pre>
          <div className="text-[11px] text-slate-500 mt-3">
            {t(
              "Tip: Open DevTools console and run: await window.__SUPABASE_SELFTEST__()",
              "အကြံ: DevTools console မှာ: await window.__SUPABASE_SELFTEST__() လို့ စမ်းပါ"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ Created: $DIAG"

# -----------------------------------------------------------------------------
# 3) Add /diag route to src/App.tsx (public route)
# -----------------------------------------------------------------------------
if [ ! -f "$APP" ]; then
  echo "❌ Missing $APP"
  exit 1
fi

if ! grep -q 'Diagnostics' "$APP"; then
  cp -f "$APP" "${APP}.bak.$(date +%Y%m%d_%H%M%S)" || true

  # Add import
  perl -0777 -i -pe '
    if ($_ !~ /from\s+"\.\/pages\/Diagnostics"/) {
      $_ =~ s/(import[\s\S]*?;\s*)(\s*export default function App)/$1import Diagnostics from "\.\/pages\/Diagnostics";\n\n$2/s;
    }
    $_;
  ' "$APP"

  # Add route under other public routes
  perl -0777 -i -pe '
    if ($_ !~ /path="\/diag"/) {
      $_ =~ s/(<Route path="\/unauthorized"[^>]*\/>\s*)/$1\n              <Route path="\/diag" element={<Diagnostics \/>} \/>\n/s;
    }
    $_;
  ' "$APP"

  echo "✅ Patched: $APP (added /diag route)"
else
  echo "ℹ️ $APP already references Diagnostics"
fi

echo ""
echo "✅ DONE (EN/MM)"
echo "Next:"
echo "  npm run build"
echo "  git add src/lib/supabase.ts src/pages/Diagnostics.tsx src/App.tsx"
echo "  git commit -m \"chore: add supabase diagnostics\""
echo "  git push"
echo "  npx vercel --prod --force"
echo ""
echo "After deploy open:"
echo "  https://www.britiumexpress.com/diag"
echo "Then in console run:"
echo "  await window.__SUPABASE_SELFTEST__()"
