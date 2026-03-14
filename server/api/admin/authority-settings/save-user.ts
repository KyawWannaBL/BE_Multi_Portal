import { supabase } from "@/lib/supabase";

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") return bad(res, "Method not allowed", 405);

    const userId = String(req.body?.userId || "").trim();
    const permissions = req.body?.permissions || {};

    if (!userId) return bad(res, "userId is required");

    const rows = Object.entries(permissions).map(([permission_key, allowed]) => ({
      user_id: userId,
      permission_key,
      allowed: Boolean(allowed),
    }));

    if (rows.length) {
      const { error } = await supabase.from("user_authorities").upsert(rows, { onConflict: "user_id,permission_key" });
      if (error) return bad(res, error.message, 500);
    }

    return res.status(200).json({ ok: true, message: "User authorities saved" });
  } catch (error: any) {
    return bad(res, error?.message || "Unexpected server error", 500);
  }
}
