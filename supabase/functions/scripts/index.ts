import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function mustEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function findUserByEmail(supabase: any, email: string) {
  const target = email.toLowerCase();
  const perPage = 1000;

  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((u: any) => (u.email ?? "").toLowerCase() === target);
    if (found) return found;

    if (data.users.length < perPage) return null;
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("POST only", { status: 405 });

    const adminSecret = mustEnv("RESET_ADMIN_SECRET");
    const initialPassword = mustEnv("INITIAL_PASSWORD");

    const provided = req.headers.get("x-admin-secret");
    if (!provided || provided !== adminSecret) return new Response("Forbidden", { status: 403 });

    const supabase = createClient(
      mustEnv("SUPABASE_URL"),
      mustEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: seed, error: seedErr } = await supabase
      .from("users_2026_02_12_13_00")
      .select("email, role, full_name, employee_id, city, department, is_active")
      .eq("is_active", true);

    if (seedErr) return new Response(seedErr.message, { status: 500 });

    let created = 0;
    let updated = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const u of seed ?? []) {
      const email = u.email.toLowerCase();

      try {
        const existing = await findUserByEmail(supabase, email);

        let userId: string;

        if (existing) {
          userId = existing.id;

          const { error } = await supabase.auth.admin.updateUserById(userId, {
            password: initialPassword,
            email_confirm: true,
            user_metadata: {
              role: u.role,
              full_name: u.full_name,
              employee_id: u.employee_id,
              city: u.city,
              department: u.department,
              must_change_password: true,
            },
          });
          if (error) throw error;

          updated++;
        } else {
          const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: initialPassword,
            email_confirm: true,
            user_metadata: {
              role: u.role,
              full_name: u.full_name,
              employee_id: u.employee_id,
              city: u.city,
              department: u.department,
              must_change_password: true,
            },
          });
          if (error) throw error;

          userId = data.user?.id;
          if (!userId) throw new Error("createUser returned no user id");

          created++;
        }

        const { error: profileErr } = await supabase.from("profiles").upsert({
          id: userId,
          email,
          role: u.role,
          must_change_password: true,
          display_name: u.full_name,
          status: "active",
        });
        if (profileErr) throw profileErr;
      } catch (e: any) {
        errors.push({ email: u.email, error: String(e?.message ?? e) });
      }
    }

    return new Response(JSON.stringify({ created, updated, errorCount: errors.length, errors }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(String(e?.message ?? e), { status: 500 });
  }
});
