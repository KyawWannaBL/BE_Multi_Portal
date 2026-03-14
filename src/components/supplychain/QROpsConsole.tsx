import React, { useEffect, useState } from "react";
import { recordSupplyEvent, listMyRecentEvents } from "@/services/supplyChain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export function QROpsConsole({
  segment,
  title,
  eventTypes,
  defaultEventType,
}: {
  segment: string;
  title: string;
  eventTypes: string[];
  defaultEventType?: string;
}) {
  const [wayId, setWayId] = useState("");
  const [eventType, setEventType] = useState(defaultEventType ?? eventTypes[0]);
  const [recent, setRecent] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setRecent(await listMyRecentEvents());
    } catch {
      setRecent([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit() {
    const v = wayId.trim();
    if (!v) {
      toast({ title: "WAY ID required / WAY ID လိုအပ်ပါသည်", variant: "destructive" as any });
      return;
    }

    setBusy(true);
    try {
      await recordSupplyEvent({ way_id: v, event_type: eventType, segment });
      setWayId("");
      await refresh();
      toast({ title: "Recorded / မှတ်တမ်းတင်ပြီး", description: `${v} • ${eventType}` });
    } catch (e: any) {
      toast({ title: "Failed / မအောင်မြင်ပါ", description: String(e?.message ?? e), variant: "destructive" as any });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10">
      <h2 className="text-xl font-black text-white uppercase">{title}</h2>

      <div className="grid gap-4">
        <select
          className="bg-black/40 border border-white/10 p-3 rounded-xl text-white"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          {eventTypes.map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>

        <Input
          placeholder="Scan QR / Enter Way ID"
          value={wayId}
          onChange={(e) => setWayId(e.target.value)}
          className="h-14 bg-black/40 border-white/10 text-white"
        />

        <Button onClick={() => void submit()} disabled={busy} className="h-14 bg-emerald-600 hover:bg-emerald-500 font-black uppercase tracking-widest">
          {busy ? "..." : "Record Scan / မှတ်တမ်းတင်မည်"}
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
        {recent.map((r: any) => (
          <div key={r.id} className="p-3 bg-black/30 rounded-xl text-[10px] flex justify-between border border-white/5">
            <span className="font-mono text-emerald-300">{r.way_id}</span>
            <span className="font-bold text-white">{r.event_type}</span>
          </div>
        ))}
        {!recent.length ? <div className="text-xs text-white/60">No recent events.</div> : null}
      </div>
    </div>
  );
}

export default QROpsConsole;
