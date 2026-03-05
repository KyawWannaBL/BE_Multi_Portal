import React, { useState } from "react";
import { PortalShell } from "@/components/layout/PortalShell";
import { createShipment } from "@/services/shipments";
import { recordSupplyEvent } from "@/services/supplyChain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DataEntryOpsPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Minimal form (extend for enterprise as needed)
  const [receiver_name, setReceiverName] = useState("");
  const [receiver_phone, setReceiverPhone] = useState("");
  const [receiver_address, setReceiverAddress] = useState("");
  const [receiver_city, setReceiverCity] = useState("Yangon");
  const [receiver_state, setReceiverState] = useState("MM");
  const [delivery_fee, setDeliveryFee] = useState("2000");
  const [cod_amount, setCodAmount] = useState("0");

  async function submit() {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const res = await createShipment({
        receiver_name,
        receiver_phone,
        receiver_address,
        receiver_city,
        receiver_state,
        delivery_fee: Number(delivery_fee || 0),
        cod_amount: Number(cod_amount || 0),
      });

      // Event ledger record (data entry created)
      try {
        await recordSupplyEvent({
          way_id: res.wayId,
          event_type: "DE_CREATED",
          segment: "DATA_ENTRY",
          note: "Shipment created by data entry",
          meta: { shipmentId: res.shipmentId },
        });
      } catch {}

      setMsg(`✅ Created shipment: ${res.wayId} (EN: print label / MY: label ထုတ်ပါ)`);
      setReceiverName(""); setReceiverPhone(""); setReceiverAddress(""); setCodAmount("0");
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="Data Entry Ops • Create Shipment"
      links={[
        { to: "/portal/operations", label: "Operations" },
        { to: "/portal/operations/qr-scan", label: "QR Ops" },
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-bold">Create Shipment / ပို့ဆောင်မှုဖန်တီးခြင်း</div>
          <div className="text-xs opacity-70 mt-1">
            EN: After create, WAY ID is your QR payload. <br />
            MY: ဖန်တီးပြီးနောက် WAY ID သည် QR payload ဖြစ်သည်။
          </div>

          {err ? <div className="mt-3 text-xs text-red-300">Error: {err}</div> : null}
          {msg ? <div className="mt-3 text-xs text-emerald-300">{msg}</div> : null}

          <div className="mt-4 grid gap-3">
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="Receiver name / လက်ခံသူအမည်" value={receiver_name} onChange={(e)=>setReceiverName(e.target.value)} />
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="Receiver phone / ဖုန်းနံပါတ်" value={receiver_phone} onChange={(e)=>setReceiverPhone(e.target.value)} />
            <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="Receiver address / လိပ်စာ" value={receiver_address} onChange={(e)=>setReceiverAddress(e.target.value)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="City" value={receiver_city} onChange={(e)=>setReceiverCity(e.target.value)} />
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="State" value={receiver_state} onChange={(e)=>setReceiverState(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="Delivery fee" value={delivery_fee} onChange={(e)=>setDeliveryFee(e.target.value)} />
              <Input className="bg-[#0B0E17] border border-white/10 rounded-xl h-11 text-white" placeholder="COD amount" value={cod_amount} onChange={(e)=>setCodAmount(e.target.value)} />
            </div>

            <Button disabled={busy} onClick={() => void submit()} className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black tracking-widest uppercase">
              {busy ? "..." : "Create / ဖန်တီးမည်"}
            </Button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
