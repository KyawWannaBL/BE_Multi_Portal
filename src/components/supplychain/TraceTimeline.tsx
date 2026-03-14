import React, { useState } from "react";
import { traceByWayId } from "@/services/supplyChain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TraceTimeline() {
  const [wayId, setWayId] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setErr(null);
    setBusy(true);
    try {
      const w = (wayId || "").trim().toUpperCase();
      if (!w) throw new Error("EN: Enter WAY ID | MY: WAY ID ထည့်ပါ");
      const data = await traceByWayId(w, 300);
      setRows(data);
    } catch (e: any) {
      setErr(e?.message || String(e));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="text-sm font-bold">Track & Trace / ခြေရာခံခြင်း</div>
      <div className="text-xs opacity-70">
        EN: Enter WAY ID to view full custody chain. <br />
        MY: WAY ID ထည့်ပြီး custody chain အပြည့်အစုံကြည့်ပါ။
      </div>

      <div className="flex gap-2">
        <Input
          value={wayId}
          onChange={(e) => setWayId(e.target.value)}
          className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white"
          placeholder="BTX-XXXX-XXXX"
        />
        <Button disabled={busy} onClick={() => void run()} className="h-11 rounded-xl bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black">
          {busy ? "..." : "Trace"}
        </Button>
      </div>

      {err ? <div className="text-xs text-red-300">Error: {err}</div> : null}

      <div className="grid gap-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono">{r.way_id}</div>
              <div className="text-[10px] opacity-70">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div className="text-xs mt-1">
              <span className="font-bold">{String(r.event_type || "").toUpperCase()}</span>
              <span className="opacity-70"> • {String(r.segment || "").toUpperCase()}</span>
              <span className="opacity-70"> • {String(r.actor_role || "").toUpperCase()}</span>
            </div>
            {r.note ? <div className="text-[11px] opacity-70 mt-1">{r.note}</div> : null}
            <div className="text-[10px] opacity-60 mt-1 font-mono break-all">
              hash: {r.event_hash?.slice(0, 18)}… prev: {r.prev_hash?.slice(0, 18)}…
            </div>
          </div>
        ))}
        {!rows.length && !err ? <div className="text-xs opacity-60">No data.</div> : null}
      </div>
    </div>
  );
}
