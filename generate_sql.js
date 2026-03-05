const fs = require('fs');

// Read your local CSV
const csvData = fs.readFileSync('useraccount.csv', 'utf8');
const lines = csvData.trim().split(/\r?\n/);
const users = [];

// Parse the 135 users
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length >= 3) {
    users.push({
      email: cols[0].trim(),
      role: cols[1].trim(),
      name: cols[2].trim().replace(/'/g, "''")
    });
  }
}

// Write the SQL Header & pgcrypto extension
let sql = `-- L5 Security: Enable Password Encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n`;

sql += `-- Insert 135 Users into Auth.Users
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES\n`;

// Generate the encrypted INSERT statements
const values = users.map(u => `(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '${u.email}',
  crypt('Britium@2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"${u.name}","role":"${u.role}"}',
  now(),
  now()
)`);

sql += values.join(',\n') + ';\n\n';

// Map identities so the login screen actually works
sql += `-- Map Identities for Supabase Email Login Validation
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
SELECT 
  gen_random_uuid(), id, jsonb_build_object('sub', id, 'email', email), 'email', id::text, now(), now(), now()
FROM auth.users
WHERE email IN (\n`;

const emails = users.map(u => `  '${u.email}'`);
sql += emails.join(',\n') + '\n);\n';

// Save the massive file
fs.writeFileSync('seed_users.sql', sql);
console.log(`✅ SUCCESS: Generated seed_users.sql containing ${users.length} fully encrypted accounts!`);
