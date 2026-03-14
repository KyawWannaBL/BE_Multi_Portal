import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRbac } from "@/app/providers/RbacProvider";
import { getAuthIdentity, getMerchantByEmail } from "@/services/identity";
import { createShipment, listShipmentsByMerchant, type Shipment } from "@/services/shipments";

export default function MerchantPortal() {
  const { profile } = useRbac();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderAddr, setSenderAddr] = useState("");
  const [senderCity, setSenderCity] = useState("Yangon");
  const [senderState, setSenderState] = useState("Yangon");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddr, setReceiverAddr] = useState("");
  const [receiverCity, setReceiverCity] = useState("Yangon");
  const [receiverState, setReceiverState] = useState("Yangon");

  const [deliveryFee, setDeliveryFee] = useState("2500");
  const [cod, setCod] = useState("0");
  const [desc, setDesc] = useState("");

  const load = async (mid: string) => {
    const res = await listShipmentsByMerchant(mid);
    if (res.error) setError(res.error);
    setShipments(res.data ?? []);
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setError(null);
      const { email } = await getAuthIdentity();
      if (!email) return;

      const m = await getMerchantByEmail(email);
      if (!cancelled) {
        setMerchantId(m?.id ?? null);
        if (m?.id) await load(m.id);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPreview = useMemo(() => Number(deliveryFee || 0) + Number(cod || 0), [deliveryFee, cod]);

  const onCreate = async () => {
    setError(null);
    if (!merchantId) {
      setError("Merchant record not found for this account (merchants.email).");
      return;
    }
    if (!senderName || !senderPhone || !senderAddr || !receiverName || !receiverPhone || !receiverAddr) {
      setError("Sender/Receiver name, phone, address are required.");
      return;
    }
    setBusy(true);
    const res = await createShipment({
      merchant_id: merchantId,
      sender_name: senderName,
      sender_phone: senderPhone,
      sender_address: senderAddr,
      sender_city: senderCity,
      sender_state: senderState,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_address: receiverAddr,
      receiver_city: receiverCity,
      receiver_state: receiverState,
      package_description: desc || undefined,
      delivery_fee: Number(deliveryFee || 0),
      cod_amount: Number(cod || 0),
      created_by: null,
    });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    await load(merchantId);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-2xl font-bold">Merchant Portal</div>
        <div className="text-sm text-white/60 mt-1">{profile?.email ?? "—"}</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="font-semibold">Create Shipment</div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Sender name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          <Input placeholder="Sender phone" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} />
          <Input placeholder="Sender city" value={senderCity} onChange={(e) => setSenderCity(e.target.value)} />
          <Input placeholder="Sender state" value={senderState} onChange={(e) => setSenderState(e.target.value)} />
          <Textarea className="md:col-span-2" placeholder="Sender address" value={senderAddr} onChange={(e) => setSenderAddr(e.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Receiver name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
          <Input placeholder="Receiver phone" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
          <Input placeholder="Receiver city" value={receiverCity} onChange={(e) => setReceiverCity(e.target.value)} />
          <Input placeholder="Receiver state" value={receiverState} onChange={(e) => setReceiverState(e.target.value)} />
          <Textarea className="md:col-span-2" placeholder="Receiver address" value={receiverAddr} onChange={(e) => setReceiverAddr(e.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Delivery fee" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
          <Input placeholder="COD amount" value={cod} onChange={(e) => setCod(e.target.value)} />
          <Input placeholder="Total" value={String(totalPreview)} readOnly />
        </div>

        <Textarea placeholder="Package description / instructions" value={desc} onChange={(e) => setDesc(e.target.value)} />

        <Button onClick={onCreate} disabled={busy}>
          {busy ? "Creating..." : "Create Shipment"}
        </Button>

        <div className="text-xs text-white/50">
          Requires RLS: INSERT on shipments + shipment_tracking, and SELECT on shipments by your merchant scope.
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="font-semibold">My Shipments</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60">
              <tr>
                <th className="text-left py-2">Way ID</th>
                <th className="text-left py-2">Receiver</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="py-2 font-mono">{s.way_id}</td>
                  <td className="py-2">{s.receiver_name} ({s.receiver_phone})</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2 text-right">{Number(s.total_amount).toLocaleString()}</td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td className="py-4 text-white/50" colSpan={4}>
                    No shipments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
