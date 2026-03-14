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
