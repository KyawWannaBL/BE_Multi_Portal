#!/usr/bin/env bash
set -euo pipefail

export SUPABASE_URL=$(echo "${SUPABASE_URL:-}" | tr -d '\r' | xargs)
export SUPABASE_SERVICE_ROLE_KEY=$(echo "${SUPABASE_SERVICE_ROLE_KEY:-}" | tr -d '\r' | xargs)

create_identity() {
  local email=$(echo "$1" | tr -d '\r' | xargs)
  local role=$(echo "$2" | tr -d '\r' | xargs)
  local pass_env="$3"
  local password=$(echo "${!pass_env:-}" | tr -d '\r' | xargs)

  echo "==> Deploying Identity: $email ($role)"

  node <<'NODE'
    const https = require('https');
    const url = process.env.SUPABASE_URL.replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const email = process.env.TARGET_EMAIL;
    const password = process.env.TARGET_PASSWORD;
    const role = process.env.TARGET_ROLE;

    const data = JSON.stringify({
      email, password, email_confirm: true,
      app_metadata: { role }, user_metadata: { role }
    });

    const options = {
      hostname: url.replace('https://', ''),
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'apikey': key, 'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`    ✅ Success.`);
        } else {
          console.log(`    ❌ Error ${res.statusCode}: ${body}`);
        }
      });
    });
    req.on('error', (e) => console.error(`    ❌ Connection Error: ${e.message}`));
    req.write(data); req.end();
NODE
  # Wait 2 seconds to prevent Supabase 500 errors (SIN region stability)
  sleep 2
}

# --- Operational Accounts ---
export TARGET_PASSWORD="$PW_DEFAULT_DEMO"
create_identity "merchant_demo@britiumexpress.com" "merchant" "TARGET_PASSWORD"
create_identity "rider_demo@britiumexpress.com" "RIDER" "TARGET_PASSWORD"
create_identity "warehouse_demo@britiumexpress.com" "WAREHOUSE" "TARGET_PASSWORD"
create_identity "finance_cashier_demo@britiumexpress.com" "FINANCE_CASHIER" "TARGET_PASSWORD"

echo "🏁 All Accounts Processed."
