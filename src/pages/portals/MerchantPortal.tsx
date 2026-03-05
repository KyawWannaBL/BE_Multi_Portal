import React, { useEffect, useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { createShipment, listMerchantShipments, type Shipment } from "@/services/shipments";

export default function MerchantPortal() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [createdWayId, setCreatedWayId] = useState<string | null>(null);

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    receiver_city: "Yangon",
    receiver_state: "Yangon",
    package_description: "",
    package_weight: 1,
    delivery_fee: 2500,
    cod_amount: 0,
  });

  async function refresh() {
    try {
      setErr(null);
      const rows = await listMerchantShipments();
      setShipments(rows);
    } catch (e: any) {
      setErr(e.message || String(e));
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setCreatedWayId(null);
    setErr(null);
    try {
      const { wayId } = await createShipment({
        receiver_name: form.receiver_name,
        receiver_phone: form.receiver_phone,
        receiver_address: form.receiver_address,
        receiver_city: form.receiver_city,
        receiver_state: form.receiver_state,
        package_description: form.package_description || undefined,
        package_weight: Number(form.package_weight || 0) || undefined,
        delivery_fee: Number(form.delivery_fee || 0),
        cod_amount: Number(form.cod_amount || 0) || undefined,
      });
      setCreatedWayId(wayId);
      setForm((s) => ({ ...s, receiver_name: "", receiver_phone: "", receiver_address: "", package_description: "", cod_amount: 0 }));
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PortalShell title="Merchant Portal" links={[{ to: "/portal/customer", label: "Customer Tracking" }]}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold tracking-wide">Create Shipment</div>
          <div className="text-xs opacity-70">Creates shipment + tracking + supervisor approval request.</div>

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="Receiver name" value={form.receiver_name} onChange={(e) => setForm({ ...form, receiver_name: e.target.value })} required />
              <input className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="Receiver phone" value={form.receiver_phone} onChange={(e) => setForm({ ...form, receiver_phone: e.target.value })} required />
            </div>
            <input className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
              placeholder="Receiver address" value={form.receiver_address} onChange={(e) => setForm({ ...form, receiver_address: e.target.value })} required />
            <div className="grid md:grid-cols-4 gap-3">
              <input className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="City" value={form.receiver_city} onChange={(e) => setForm({ ...form, receiver_city: e.target.value })} />
              <input className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="State" value={form.receiver_state} onChange={(e) => setForm({ ...form, receiver_state: e.target.value })} />
              <input type="number" min={0} className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="Delivery fee" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: Number(e.target.value) })} required />
              <input type="number" min={0} className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="COD amount" value={form.cod_amount} onChange={(e) => setForm({ ...form, cod_amount: Number(e.target.value) })} />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="Package description" value={form.package_description} onChange={(e) => setForm({ ...form, package_description: e.target.value })} />
              <input type="number" min={0} step="0.1" className="w-full rounded-2xl bg-black/20 border border-white/10 px-3 py-2 text-sm"
                placeholder="Weight (kg)" value={form.package_weight} onChange={(e) => setForm({ ...form, package_weight: Number(e.target.value) })} />
            </div>

            {createdWayId ? (
              <div className="text-xs text-emerald-300">Created Way ID: <span className="font-mono">{createdWayId}</span></div>
            ) : null}
            {err ? <div className="text-xs text-red-400">Error: {err}</div> : null}

            <button disabled={busy} className="w-fit text-xs px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50">
              {busy ? "Creating…" : "Create"}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold tracking-wide">My Shipments</div>
          <div className="mt-3 grid gap-2">
            {shipments.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{s.way_id}</div>
                  <div className="text-[10px] opacity-70">{new Date(s.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm">{s.receiver_name}</div>
                <div className="text-xs opacity-70">{s.receiver_phone} • {s.receiver_address}</div>
                <div className="text-xs opacity-70 mt-1">Assigned: {s.assigned_rider_id ? "Yes" : "No"} • Delivered: {s.actual_delivery_time ? "Yes" : "No"}</div>
              </div>
            ))}
            {!shipments.length ? <div className="text-xs opacity-60">No shipments yet.</div> : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
