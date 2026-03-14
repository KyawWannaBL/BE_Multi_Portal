import { supabase } from "@/lib/supabase";

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return bad(res, "Method not allowed", 405);
    }

    const { userId } = req.body || {};
    if (!userId) return bad(res, "userId is required");

    const { data, error } = await supabase.rpc("rpc_admin_soft_delete_account", {
      p_user_id: userId,
    });

    if (error) return bad(res, error.message, 500);

    return res.status(200).json({
      ok: true,
      item: data,
      message: "Account deleted",
    });
  } catch (err: any) {
    return bad(res, err?.message || "Unexpected server error", 500);
  }
}
