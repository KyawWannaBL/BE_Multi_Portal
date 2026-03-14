// @ts-nocheck
import React from "react";

export default function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="min-h-[30vh] flex flex-col items-center justify-center text-center p-8 border border-white/10 rounded-3xl bg-[#0B101B]">
      <div className="text-lg font-black tracking-widest uppercase text-white">{title}</div>
      {hint ? <div className="text-xs text-slate-400 font-mono mt-2 max-w-xl">{hint}</div> : null}
    </div>
  );
}
