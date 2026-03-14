import { supabase } from "@/lib/supabase";
import { authorityPermissions } from "@/config/authorityPermissions";

function ok(res: any, payload: any) {
  return res.status(200).json(payload);
}

function bad(res: any, message: string, status = 400) {
  return res.status(status).json({ ok: false, error: message });
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") return bad(res, "Method not allowed", 405);

    const role = String(req.query?.role || "SUPER_ADMIN");
    const userId = String(req.query?.userId || "");

    const [{ data: profiles }, { data: roleRows }, { data: userRows }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role").order("created_at", { ascending: false }),
      supabase.from("role_authorities").select("permission_key, allowed").eq("role", role),
      userId
        ? supabase.from("user_authorities").select("permission_key, allowed").eq("user_id", userId)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const roleAuthorities = Object.fromEntries((roleRows || []).map((x: any) => [x.permission_key, Boolean(x.allowed)]));
    const userAuthorities = Object.fromEntries((userRows || []).map((x: any) => [x.permission_key, Boolean(x.allowed)]));

    return ok(res, {
      ok: true,
      permissions: authorityPermissions,
      profiles: profiles || [],
      roleAuthorities,
      userAuthorities,
    });
  } catch (error: any) {
    return bad(res, error?.message || "Unexpected server error", 500);
  }
}
