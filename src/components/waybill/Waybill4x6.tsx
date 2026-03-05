import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

export type WaybillPrintModel = {
  way_id: string;
  created_at: string;
  printed_by_profile_id: string;

  sender_name: string;
  sender_phone: string;
  sender_address: string;

  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;

  receiver_city: string;

  cbm: number;
  package_weight: number | null;
  delivery_type: string;

  item_price: number;
  delivery_fee: number;
  prepaid_to_os: number;
  cod_amount: number;

  remarks?: string | null;
};

function fmt(n: number) {
  const v = Number(n || 0);
  return v.toLocaleString("en-US");
}

export function Waybill4x6({ m }: { m: WaybillPrintModel }) {
  const [qr, setQr] = useState<string>("");

  const qrPayload = useMemo(() => m.way_id, [m.way_id]);

  useEffect(() => {
    (async () => {
      const url = await QRCode.toDataURL(qrPayload, { width: 220, margin: 1, errorCorrectionLevel: "M" });
      setQr(url);
    })().catch(() => setQr(""));
  }, [qrPayload]);

  return (
    <div className="waybill-page">
      <div className="wb">
        <div className="wb-header">
          <div className="wb-brand">
            <div className="wb-title">BRITIUM EXPRESS</div>
            <div className="wb-sub">DELIVERY SERVICE</div>
            <div className="wb-hotline">HotLine: 09 - 897 44 77 44</div>
          </div>

          <div className="wb-qr">
            <div className="wb-time">{new Date(m.created_at).toLocaleString()}</div>
            {qr ? <img className="wb-qrimg" src={qr} alt="QR" /> : <div className="wb-qrph">QR</div>}
          </div>
        </div>

        <div className="wb-topline">
          <div className="wb-merchant">
            <div><b>Merchant</b> : {m.sender_name}</div>
            <div>{m.sender_phone}</div>
            <div className="wb-addr">{m.sender_address}</div>
          </div>

          <div className="wb-wayid">
            <div className="wb-way">{m.way_id}</div>
            <div className="wb-profile">Printed by: {m.printed_by_profile_id}</div>
          </div>
        </div>

        <div className="wb-rec">
          <div className="wb-rec-title"><b>Recipient</b> :</div>
          <div className="wb-rec-name">{m.receiver_name}</div>
          <div className="wb-rec-phone">{m.receiver_phone}</div>
          <div className="wb-rec-addr">{m.receiver_address}</div>
          <div className="wb-rec-city">{m.receiver_city}</div>
        </div>

        <div className="wb-sign">
          <div className="wb-sign-col"><b>** မူရင်း **</b></div>
          <div className="wb-sign-col"><b>** လက်ခံသူ (လက်မှတ်) **</b></div>
        </div>

        <div className="wb-mid">
          <div className="wb-mid-left">
            <div>CBM : <b>{m.cbm ?? 1}</b></div>
            <div>Weight (kg) : <b>{m.package_weight ?? "-"}</b></div>
            <div>Delivery : <b>{m.delivery_type || "Normal"}</b></div>
          </div>

          <div className="wb-mid-mid">
            <div>Item Price : <b>{fmt(m.item_price)}</b></div>
            <div>Delivery Fees : <b>{fmt(m.delivery_fee)}</b></div>
            <div>Prepaid to OS : <b>{fmt(m.prepaid_to_os)}</b></div>
          </div>

          <div className="wb-mid-cod">
            <div className="wb-cod-label">COD</div>
            <div className="wb-cod-amt">{fmt(m.cod_amount)}</div>
            <div className="wb-cod-cur">MMK</div>
          </div>
        </div>

        <div className="wb-remarks">
          <div className="wb-remarks-title">Remarks :</div>
          <div className="wb-remarks-body">{m.remarks || "—"}</div>
        </div>

        <div className="wb-footer">
          Hotline သို့ ဆက်သွယ်၍ Track & Trace ပြုလုပ်နိုင်ပါသည်။
        </div>
      </div>

      <style>{`
        /* EN: Print size 4in x 6in (100mm x 150mm) | MY: 4in x 6in */
        .waybill-page { width: 100mm; height: 150mm; }
        .wb { width: 100mm; height: 150mm; box-sizing: border-box; padding: 6mm; font-family: Arial, "Noto Sans Myanmar", sans-serif; color:#000; background:#fff; border:1px solid #000; }
        .wb-header { display:flex; justify-content:space-between; gap:6mm; border-bottom:1px solid #000; padding-bottom:2mm; }
        .wb-title { font-weight:800; font-size:16px; letter-spacing:0.5px; }
        .wb-sub { font-weight:700; font-size:12px; margin-top:1px; }
        .wb-hotline { font-size:10px; margin-top:2px; }
        .wb-qr { text-align:right; }
        .wb-time { font-size:10px; margin-bottom:2mm; }
        .wb-qrimg { width:28mm; height:28mm; border:1px solid #000; }
        .wb-topline { display:flex; justify-content:space-between; gap:4mm; padding-top:2mm; border-bottom:1px solid #000; padding-bottom:2mm; }
        .wb-merchant { font-size:10px; line-height:1.25; }
        .wb-addr { font-size:9px; }
        .wb-wayid { text-align:right; }
        .wb-way { font-family: monospace; font-weight:800; font-size:12px; }
        .wb-profile { font-size:9px; margin-top:1mm; }
        .wb-rec { padding:2mm 0; border-bottom:1px solid #000; }
        .wb-rec-title { font-size:11px; }
        .wb-rec-name { font-size:14px; font-weight:800; margin-top:1mm; }
        .wb-rec-phone { font-size:12px; font-weight:800; margin-top:1mm; }
        .wb-rec-addr { font-size:11px; margin-top:1mm; }
        .wb-rec-city { font-size:11px; font-weight:700; margin-top:1mm; }
        .wb-sign { display:flex; justify-content:space-between; padding:2mm 0; border-bottom:1px solid #000; font-size:10px; }
        .wb-mid { display:grid; grid-template-columns: 1fr 1fr 34mm; gap:2mm; padding:2mm 0; border-bottom:1px solid #000; font-size:10px; }
        .wb-mid-cod { border:1px solid #000; border-radius:3mm; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2mm; }
        .wb-cod-label { font-weight:800; font-size:12px; }
        .wb-cod-amt { font-weight:900; font-size:18px; }
        .wb-cod-cur { font-size:10px; }
        .wb-remarks { padding-top:2mm; font-size:10px; }
        .wb-remarks-title { font-weight:700; }
        .wb-remarks-body { border-top:1px solid #000; margin-top:1mm; padding-top:1mm; min-height:10mm; }
        .wb-footer { position:absolute; bottom:6mm; left:6mm; right:6mm; font-size:9px; border-top:1px solid #000; padding-top:2mm; text-align:center; }
      `}</style>
    </div>
  );
}
