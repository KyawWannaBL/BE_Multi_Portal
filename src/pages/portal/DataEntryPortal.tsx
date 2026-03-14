import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { createShipment } from "@/services/shipments";

export default function DataEntryPortal() {
  const [merchantEmail, setMerchantEmail] = useState("");
  const [merchantId, setMerchantId] = useState<string | null>(null);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderAddr, setSenderAddr] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddr, setReceiverAddr] = useState("");

  const [deliveryFee, setDeliveryFee] = useState("2500");
  const [cod, setCod] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resolveMerchant = async () => {
    setError(null);
    setMerchantId(null);
    if (!merchantEmail.trim()) return;

    try {
      const { data, error } = await supabase
        .from("merchants")
        .select("id, email, business_name")
        .eq("email", merchantEmail.trim())
        .maybeSingle();

      if (error) throw error;
      setMerchantId((data as any)?.id ?? null);
      if (!(data as any)?.id) setError("Merchant not found in merchants table.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to resolve merchant");
    }
  };

  const onCreate = async () => {
    setError(null);
    if (!merchantId) {
      setError("Resolve merchant first.");
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
      sender_city: "Yangon",
      sender_state: "Yangon",
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_address: receiverAddr,
      receiver_city: "Yangon",
      receiver_state: "Yangon",
      delivery_fee: Number(deliveryFee || 0),
      cod_amount: Number(cod || 0),
      created_by: null,
    });
    setBusy(false);
    if (res.error) setError(res.error);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Data Entry Portal</div>
        <div className="text-sm text-white/60 mt-1">Create shipments on behalf of merchants</div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="font-semibold">Merchant Lookup</div>
        <div className="flex gap-3 flex-col md:flex-row">
          <Input placeholder="merchant email" value={merchantEmail} onChange={(e) => setMerchantEmail(e.target.value)} />
          <Button variant="secondary" onClick={resolveMerchant}>Resolve</Button>
        </div>
        <div className="text-xs text-white/60">merchant_id: <span className="font-mono">{merchantId ?? "—"}</span></div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="font-semibold">Shipment</div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Sender name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
          <Input placeholder="Sender phone" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} />
          <Textarea className="md:col-span-2" placeholder="Sender address" value={senderAddr} onChange={(e) => setSenderAddr(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Receiver name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
          <Input placeholder="Receiver phone" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
          <Textarea className="md:col-span-2" placeholder="Receiver address" value={receiverAddr} onChange={(e) => setReceiverAddr(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Delivery fee" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
          <Input placeholder="COD" value={cod} onChange={(e) => setCod(e.target.value)} />
        </div>
        <Button onClick={onCreate} disabled={busy}>{busy ? "Creating..." : "Create"}</Button>
        <div className="text-xs text-white/50">Requires RLS: data entry role must be allowed to insert shipments for merchants.</div>
      </div>
    </div>
  );
}
