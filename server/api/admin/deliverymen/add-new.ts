import { supabase } from "@/lib/supabase";

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        mode: "form",
        message: "Add New Deliveryman form endpoint",
      });
    }

    if (req.method !== "POST") {
      return bad(res, "Method not allowed", 405);
    }

    const body = req.body || {};

    const payload = {
      staff_code: String(body.staff_code || "").trim(),
      name: String(body.name || "").trim(),
      phone: String(body.phone || "").trim(),
      email: String(body.email || "").trim() || null,
      branch_id: body.branch_id || null,
      vehicle_type: String(body.vehicle_type || "").trim() || null,
      license_no: String(body.license_no || "").trim() || null,
      status: String(body.status || "ACTIVE").trim().toUpperCase(),
    };

    if (!payload.staff_code) return bad(res, "staff_code is required");
    if (!payload.name) return bad(res, "name is required");
    if (!payload.phone) return bad(res, "phone is required");
    if (!["ACTIVE", "INACTIVE"].includes(payload.status)) {
      return bad(res, "status must be ACTIVE or INACTIVE");
    }

    const { data, error } = await supabase
      .from("deliverymen")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return bad(res, error.message, 500);
    }

    return res.status(200).json({
      ok: true,
      item: data,
      message: "Deliveryman created successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Unexpected server error",
    });
  }
}
