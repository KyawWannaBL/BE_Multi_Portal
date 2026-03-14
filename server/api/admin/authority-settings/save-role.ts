import { supabase } from "@/lib/supabase";

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return bad(res, "Method not allowed", 405);

    const role = String(req.body?.role || "").trim();
    const permissions = req.body?.permissions || {};

    if (!role) return bad(res, "role is required");

    const rows = Object.entries(permissions).map(([permission_key, allowed]) => ({
      role,
      permission_key,
      allowed: Boolean(allowed),
    }));

    if (rows.length) {
      const { error } = await supabase.from("role_authorities").upsert(rows, { onConflict: "role,permission_key" });
      if (error) return bad(res, error.message, 500);
    }

    return res.status(200).json({ ok: true, message: "Role authorities saved" });
  } catch (error: any) {
    return bad(res, error?.message || "Unexpected server error", 500);
  }
}
