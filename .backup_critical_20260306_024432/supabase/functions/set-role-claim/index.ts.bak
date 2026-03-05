import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id, role } = await req.json();
    if (!user_id || !role) throw new Error("Missing user_id or role");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const roleUpper = String(role).trim().toUpperCase();

    // 1) Update Auth app_metadata role (JWT uses app_metadata.role)
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      app_metadata: { role: roleUpper, app_role: roleUpper },
    });
    if (error) throw error;

    const email = (data as any)?.user?.email?.toLowerCase?.() ?? null;

    // 2) Keep public.users role in sync (identity + FK)
    //    id = auth.users.id
    try {
      await supabaseAdmin.from("users").upsert(
        { id: user_id, email, role: roleUpper },
        { onConflict: "id" }
      );
    } catch (_) {}

    // 3) Keep profiles role in sync (Login UI + routing)
    try {
      await supabaseAdmin.from("profiles").upsert(
        { id: user_id, role: roleUpper, role_code: roleUpper, app_role: roleUpper, user_role: roleUpper },
        { onConflict: "id" }
      );
    } catch (_) {}

    return new Response(JSON.stringify({ ok: true, user_id, role: roleUpper }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
