import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// IMPORTANT: service role key MUST stay server-side only.
const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

const DEFAULT_PASSWORD = "P@ssw0rd1";

const USERS: Array<{ email: string; role: string }> = [
  { email: "bd_assist@britiumexpress.com", role: "STAFF" },
  { email: "rider_ygn0001@britiumexpress.com", role: "RIDER" },
  { email: "md@britiumexpress.com", role: "APP_OWNER" },
  { email: "br_mgr1@britiumexpress.com", role: "SUPERVISOR" },
  { email: "admin@britiumexpress.com", role: "SUPER_ADMIN" },
  { email: "warehouse_mgr@britiumexpress.com", role: "WAREHOUSE_MANAGER" },
  { email: "merchant_01@britiumexpress.com", role: "MERCHANT" },
  { email: "driver_ygn001@britiumexpress.com", role: "DRIVER" },
  { email: "cs_1@britiumexpress.com", role: "CUSTOMER_SERVICE" },
  { email: "finance@britiumexpress.com", role: "FINANCE_STAFF" },
  { email: "cashier_1@britiumexpress.com", role: "FINANCE_USER" },
  { email: "mgkyawwanna@gmail.com", role: "SUPER_ADMIN" },
  { email: "aln_br@britiumexpress.com", role: "SUBSTATION_MANAGER" },
  { email: "hradmin_am@britiumexpress.com", role: "HR_ADMIN" },
  { email: "dataentry001@britiumexpress.com", role: "DATA_ENTRY" },
  { email: "helper_ygn001@britiumexpress.com", role: "HELPER" },
  { email: "info@britiumexpress.com", role: "MARKETING_ADMIN" },
  { email: "hod@britiumexpress.com", role: "OPERATIONS_ADMIN" },
  { email: "sai@britiumexpress.com", role: "SUPER_ADMIN" },
  { email: "customer_01@britiumexpress.com", role: "CUSTOMER" },
  { email: "admin_npw@britiumexpress.com", role: "SUBSTATION_MANAGER" },
];

async function upsertProfile(userId: string, email: string, role: string) {
  // Adjust column names to match your `public.profiles` table
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        role,
        is_active: true,
        must_change_password: true, // mandatory reset on first login
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

async function run() {
  for (const u of USERS) {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      // If already exists, fetch by listUsers and continue
      console.error(`createUser failed for ${u.email}:`, error.message);
      continue;
    }

    const userId = data.user.id;
    await upsertProfile(userId, u.email, u.role);

    console.log(`OK: ${u.email} -> ${u.role}`);
  }

  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});