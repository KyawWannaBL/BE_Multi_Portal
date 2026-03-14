import * as React from "react";
import { getPortalList, type PortalRow } from "../api/portalApi";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ScreenConfig } from "../types";
import PortalTable from "./PortalTable";

export default function BilingualPortalScreen({ screen }: { screen: ScreenConfig }) {
  const { language, bi } = useLanguage();
  const [rows, setRows] = React.useState<PortalRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPortalList(screen.endpoint);
        if (active) setRows(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [screen.endpoint]);

  return (
    <section className="min-h-screen bg-[#05080F] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl border border-gold-500/20 bg-navy-900/50 p-6">
          <h1 className="text-2xl font-bold">{screen.title[language]}</h1>
          <p className="mt-2 text-sm text-gray-300">{screen.description[language]}</p>

          {screen.mergeCandidateKeys?.length ? (
            <div className="mt-4 text-xs text-gold-400">
              {bi("Merge candidate module keys:", "ပေါင်းစည်းအသုံးပြုနိုင်သော module keys:")}{" "}
              {screen.mergeCandidateKeys.join(", ")}
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-xl border border-gold-500/20 bg-navy-900/50 p-6 text-sm text-gray-300">
            {bi("Loading...", "ဖွင့်နေသည်...")}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 text-sm text-red-300">
            {bi("Error:", "အမှားဖြစ်ပွားခဲ့သည်:")} {error}
          </div>
        ) : screen.columns.length ? (
          <PortalTable columns={screen.columns} rows={rows} />
        ) : (
          <div className="rounded-xl border border-gold-500/20 bg-navy-900/50 p-6 text-sm text-gray-300">
            {bi(
              "Connect this screen to your backend form metadata endpoint.",
              "ဒီမျက်နှာပြင်အတွက် form metadata endpoint ကို backend နဲ့ချိတ်ဆက်ပါ။"
            )}
          </div>
        )}
      </div>
    </section>
  );
}
