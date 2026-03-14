import { supabase } from "@/lib/supabase";

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return bad(res, "Method not allowed", 405);
    }

    const { email } = req.body || {};
    if (!email) return bad(res, "email is required");

    const redirectTo = `${req.headers.origin || ""}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(String(email), {
      redirectTo,
    });

    if (error) return bad(res, error.message, 500);

    return res.status(200).json({
      ok: true,
      message: "Reset password email sent",
    });
  } catch (err: any) {
    return bad(res, err?.message || "Unexpected server error", 500);
  }
}
