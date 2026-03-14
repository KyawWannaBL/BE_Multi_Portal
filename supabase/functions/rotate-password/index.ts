/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { newPassword } = await req.json();
    if (typeof newPassword !== "string" || newPassword.length < 12) {
      return new Response(JSON.stringify({ ok: false, message: "Password must be at least 12 characters." }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), { status: 401 });

    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { Authorization: auth } } });

    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u?.user) return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), { status: 401 });

    const userId = u.user.id;

    const { data: profile } = await supabase.from("profiles").select("must_change_password").eq("id", userId).single();
    if (!profile?.must_change_password) return new Response(JSON.stringify({ ok: true, message: "No rotation required." }), { status: 200 });

    const { error: pe } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    if (pe) return new Response(JSON.stringify({ ok: false, message: pe.message }), { status: 400 });

    const { error: fe } = await supabase.from("profiles").update({ must_change_password: false }).eq("id", userId);
    if (fe) return new Response(JSON.stringify({ ok: false, message: fe.message }), { status: 400 });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

    await supabase.from("audit_logs").insert({
      user_id: userId,
      event_type: "PASSWORD_CHANGE",
      metadata: { ip, status: "SUCCESS_MANDATORY_ROTATION" },
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, message: String(e?.message || e) }), { status: 500 });
  }
});
