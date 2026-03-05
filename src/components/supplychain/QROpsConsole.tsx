import React, { useState, useEffect } from "react";
import { recordSupplyEvent, listMyRecentEvents } from "@/services/supplyChain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function QROpsConsole({ segment, title, eventTypes }: any) {
  const [wayId, setWayId] = useState("");
  const [eventType, setEventType] = useState(eventTypes[0]);
  const [recent, setRecent] = useState([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => setRecent(await listMyRecentEvents());
  useEffect(() => { refresh(); }, []);

  const submit = async () => {
    if (!wayId) return alert("Enter WAY ID");
    setBusy(true);
    try {
      await recordSupplyEvent({ way_id: wayId.trim(), event_type: eventType, segment });
      setWayId("");
      await refresh();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/10">
      <h2 className="text-xl font-black text-white uppercase">{title}</h2>
      <div className="grid gap-4">
        <select className="bg-black border border-white/10 p-3 rounded-xl text-white" value={eventType} onChange={e => setEventType(e.target.value)}>
          {eventTypes.map(ev => <option key={ev} value={ev}>{ev}</option>)}
        </select>
        <Input placeholder="Scan QR / Enter Way ID" value={wayId} onChange={e => setWayId(e.target.value)} className="h-14 bg-black border-white/10 text-white" />
        <Button onClick={submit} disabled={busy} className="h-14 bg-emerald-600 font-bold uppercase">{busy ? "Processing..." : "Record Scan"}</Button>
      </div>
      <div className="mt-6 space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase">Recent Activity</h3>
        {recent.map((r: any) => (
          <div key={r.id} className="p-3 bg-black/40 rounded-xl text-[10px] flex justify-between border border-white/5">
            <span className="font-mono text-emerald-400">{r.way_id}</span>
            <span className="font-bold text-white">{r.event_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
