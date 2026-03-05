# 1. Create the environment file (Replace with your actual keys!)
cat << 'EOF' > .env
SUPABASE_URL=https://dltavabvjwocknkyvwgz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExMzE5NCwiZXhwIjoyMDg2Njg5MTk0fQ.ckX1XXGgKPzD3IBW6yG2iG2RGfkQXyjE9IQbQZMMymA
EOF

# 2. Create the corrected Node.js script
cat << 'EOF' > seed_users.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey || url === 'https://dltavabvjwocknkyvwgz.supabase.co') {
  console.error("❌ ERROR: You must update the .env file with your actual Supabase URL and Service Role Key.");
  process.exit(1);
}

// IMPORTANT: service role key MUST stay server-side only.
const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

const DEFAULT_PASSWORD = "P@ssw0rd1";

const USERS = [
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

async function upsertProfile(userId, email, role) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email,
        role: role,
        is_active: true,
        must_change_password: true,
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

async function run() {
  console.log(`Starting account generation for ${USERS.length} accounts...`);
  
  for (const u of USERS) {
    let userId = null;

    // 1. Try to create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      // 2. If user already exists, grab their ID instead of crashing
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        console.log(`⚠️ User ${u.email} already exists. Fetching to update profile...`);
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData.users.find(user => user.email === u.email);
        if (existingUser) {
          userId = existingUser.id;
        }
      } else {
        console.error(`❌ createUser failed for ${u.email}:`, error.message);
        continue;
      }
    } else {
      userId = data.user.id;
    }

    // 3. Upsert the public profile
    if (userId) {
      try {
        await upsertProfile(userId, u.email, u.role);
        console.log(`✅ OK: ${u.email} -> ${u.role}`);
      } catch (profileError) {
        console.error(`❌ Profile creation failed for ${u.email}:`, profileError.message);
      }
    }
  }

  console.log("🎉 Done. All accounts processed!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
EOF

# 3. Ensure required packages are installed
npm install @supabase/supabase-js dotenv

# 4. Run the final script
node seed_users.js