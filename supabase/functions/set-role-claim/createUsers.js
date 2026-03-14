import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * SAFE SEED SCRIPT (server-side only)
 * - Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from environment variables.
 * - Reads DEFAULT_PASSWORD from environment variable (do NOT hardcode).
 * - Uses useraccount.sample.csv by default.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_PROJECT_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DEFAULT_PASSWORD) {
  console.error("❌ Missing env. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEFAULT_PASSWORD");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function loadUsersFromCSV() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const csvPath = path.join(__dirname, 'useraccount.sample.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('⚠️ useraccount.sample.csv missing.');
    return [];
  }

  const raw = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '');
  const lines = raw.trim().split(/\r?\n/);
  const header = lines.shift();
  if (!header) return [];

  const idx = header.split(',').reduce((acc, col, i) => {
    acc[col.trim().toLowerCase()] = i;
    return acc;
  }, {});

  return lines
    .map((line) => line.split(','))
    .filter((cols) => cols[idx.email] && cols[idx.role])
    .map((cols) => ({
      email: cols[idx.email].trim(),
      full_name: (cols[idx['full name']] || 'BRITIUM USER').trim(),
      role: cols[idx.role].trim(),
      is_active: String(cols[idx['is active']] || 'TRUE').trim().toUpperCase() === 'TRUE',
      must_change_password: String(cols[idx['must change password']] || 'TRUE').trim().toUpperCase() === 'TRUE',
      is_demo: String(cols[idx['is demo']] || 'TRUE').trim().toUpperCase() === 'TRUE',
    }));
}

async function main() {
  const users = loadUsersFromCSV();
  console.log(`Seeding ${users.length} users...`);

  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: u.full_name,
        role: u.role,
        must_change_password: u.must_change_password,
        is_active: u.is_active,
        is_demo: u.is_demo,
      },
      app_metadata: { role: u.role },
    });

    if (error) {
      console.error(`❌ ${u.email}: ${error.message}`);
      continue;
    }
    console.log(`✅ ${u.email}: created (${data.user?.id})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
