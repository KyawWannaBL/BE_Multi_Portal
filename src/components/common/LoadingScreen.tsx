// @ts-nocheck
import React from "react";

export default function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="min-h-[40vh] bg-[#05080F] flex items-center justify-center text-slate-300">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
        <div className="text-xs font-mono uppercase tracking-widest">{label ?? "Loading..."}</div>
      </div>
    </div>
  );
}
