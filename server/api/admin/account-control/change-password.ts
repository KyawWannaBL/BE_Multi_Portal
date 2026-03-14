import { supabase } from "@/lib/supabase";

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return bad(res, "Method not allowed", 405);
    }

    const { userId, newPassword } = req.body || {};

    if (!userId) return bad(res, "userId is required");
    if (!newPassword || String(newPassword).length < 6) {
      return bad(res, "newPassword must be at least 6 characters");
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: String(newPassword),
    });

    if (error) return bad(res, error.message, 500);

    return res.status(200).json({
      ok: true,
      item: data,
      message: "Password changed successfully",
    });
  } catch (err: any) {
    return bad(res, err?.message || "Unexpected server error", 500);
  }
}
