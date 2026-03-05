/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const bucket = Deno.env.get("APK_BUCKET") || "artifacts";
    const objectPath = Deno.env.get("APK_OBJECT_PATH") || "britium-release.apk";
    const ttl = Number(Deno.env.get("APK_SIGNED_URL_TTL_SECONDS") || "60");
    const sha256 = Deno.env.get("APK_SHA256") || null;

    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { Authorization: auth } } });

    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const userId = u.user.id;

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    const role = profile?.role || "";
    const allow = ["RDR", "MGR", "SUPER_ADMIN", "OPERATIONS_ADMIN"].includes(role);
    if (!allow) return new Response(JSON.stringify({ error: "AccessDenied" }), { status: 403 });

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

    await supabase.from("audit_logs").insert({
      user_id: userId,
      event_type: "APK_DOWNLOAD",
      metadata: { ip, artifact: objectPath, ttl },
    });

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectPath, ttl);
    if (error || !data?.signedUrl) return new Response(JSON.stringify({ error: "SignedUrlFailed" }), { status: 500 });

    return new Response(JSON.stringify({ signedUrl: data.signedUrl, sha256 }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
});
