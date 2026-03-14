import { supabase } from "@/lib/supabase";

function ok(res: any, payload: any) {
  return res.status(200).json(payload);
}

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      return ok(res, {
        ok: true,
        mode: "form",
        message: "Create Delivery form endpoint",
        items: [],
        total: 0,
        summary: {},
      });
    }

    if (req.method !== "POST") {
      return bad(res, "Method not allowed", 405);
    }

    const body = req.body || {};

    const payload = {
      delivery_no: String(body.delivery_no || "").trim(),
      merchant_id: body.merchant_id || null,
      sender_name: String(body.sender_name || "").trim(),
      recipient_name: String(body.recipient_name || "").trim(),
      recipient_phone: String(body.recipient_phone || "").trim(),
      pickup_township: String(body.pickup_township || "").trim() || null,
      delivery_township: String(body.delivery_township || "").trim() || null,
      delivery_address: String(body.delivery_address || "").trim(),
      parcel_count: Number(body.parcel_count || 0),
      cod_amount: Number(body.cod_amount || 0),
      status: String(body.status || "DRAFT").trim().toUpperCase(),
    };

    if (!payload.delivery_no) return bad(res, "delivery_no is required");
    if (!payload.sender_name) return bad(res, "sender_name is required");
    if (!payload.recipient_name) return bad(res, "recipient_name is required");
    if (!payload.recipient_phone) return bad(res, "recipient_phone is required");
    if (!payload.delivery_address) return bad(res, "delivery_address is required");
    if (!payload.parcel_count) return bad(res, "parcel_count is required");

    return ok(res, {
      ok: true,
      item: payload,
      message: "Create delivery accepted",
    });
  } catch (error: any) {
    return bad(res, error?.message || "Unexpected server error", 500);
  }
}
