import React from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminPlaceholderPage({
  titleEn,
  titleMy,
  descriptionEn,
  descriptionMy,
}: {
  titleEn: string;
  titleMy: string;
  descriptionEn?: string;
  descriptionMy?: string;
}) {
  const { language, bi } = useLanguage();
  const location = useLocation();

  return (
    <div className="p-6 md:p-8 animate-in fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white">
          {language === "en" ? titleEn : titleMy}
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          {bi(
            descriptionEn || "This production-safe placeholder route is ready for real screen integration.",
            descriptionMy || "ဒီ production-safe placeholder route သည် တကယ့် screen integration အတွက် အဆင်သင့်ဖြစ်နေပါသည်။"
          )}
        </p>
        <p className="mt-2 text-[10px] font-mono text-emerald-400 uppercase">
          {location.pathname}
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0A0E17] p-6 text-sm text-gray-300">
        {bi(
          "This screen was added without deleting any existing admin functions. Connect your real API, list, form, or report component here.",
          "ဤမျက်နှာပြင်ကို ရှိပြီးသား admin functions များကို မဖျက်ဘဲ ထည့်သွင်းထားပါသည်။ သင့်တကယ့် API၊ list၊ form သို့မဟုတ် report component ကို ဒီနေရာတွင် ချိတ်ဆက်ပါ။"
        )}
      </div>
    </div>
  );
}
