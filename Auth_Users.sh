#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Supabase User Provisioning (EN/MM)
# EN: Creates Auth users + upserts profiles (role + must_change_password)
# MM: Auth user ဖန်တီးပြီး profiles ကို role + must_change_password နဲ့ upsert လုပ်မည်
#
# Requires:
#   SUPABASE_URL
#   SUPABASE_SERVICE_ROLE_KEY
#
# Passwords MUST come from env vars (do NOT hardcode secrets in git).
# ==============================================================================

require() { [[ -n "${!1:-}" ]] || { echo "Missing env: $1" >&2; exit 1; }; }

SUPABASE_URL="https://dltavabvjwocknkyvwgz.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExMzE5NCwiZXhwIjoyMDg2Njg5MTk0fQ.ckX1XXGgKPzD3IBW6yG2iG2RGfkQXyjE9IQbQZMMymA"

API="${SUPABASE_URL%/}"
KEY="$SUPABASE_SERVICE_ROLE_KEY"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq required. Install: sudo apt-get install -y jq (or brew install jq)" >&2
  exit 1
fi

auth_create_user() {
  local email="$1"
  local password="$2"
  local role="$3"
  local must_change="$4" # true/false

  curl -sS -X POST "$API/auth/v1/admin/users" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "content-type: application/json" \
    -d "$(jq -n \
      --arg email "$email" \
      --arg password "$password" \
      --arg role "$role" \
      --argjson must_change "$must_change" \
      '{
        email: $email,
        password: $password,
        email_confirm: true,
        app_metadata: { role: $role },
        user_metadata: { must_change_password: $must_change }
      }')" \
    | jq -c .
}

profiles_upsert() {
  local id="$1"
  local email="$2"
  local role="$3"
  local must_change="$4" # true/false

  # Upsert into profiles by id (preferred). Your profiles table must allow service-role insert/update.
  curl -sS -X POST "$API/rest/v1/profiles?on_conflict=id" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "content-type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=representation" \
    -d "$(jq -n \
      --arg id "$id" \
      --arg email "$email" \
      --arg role "$role" \
      --argjson must_change "$must_change" \
      '{
        id: $id,
        email: $email,
        role: $role,
        must_change_password: $must_change
      }')" \
    | jq -c .
}

create_or_report() {
  local email="$1"
  local role="$2"
  local pass_env="$3"
  local must_change="$4" # true/false

  local password="${!pass_env:-}"
  if [[ -z "$password" ]]; then
    echo "Missing password env for $email: $pass_env" >&2
    return 1
  fi

  echo "==> Creating user: $email role=$role must_change=$must_change"
  local res
  res="$(auth_create_user "$email" "$password" "$role" "$must_change")"

  # If already exists, Supabase returns an error; print it and continue.
  if echo "$res" | jq -e '.id' >/dev/null 2>&1; then
    local id
    id="$(echo "$res" | jq -r '.id')"
    echo "   Auth OK: id=$id"

    local p
    p="$(profiles_upsert "$id" "$email" "$role" "$must_change")"
    echo "   Profiles upsert OK: $(echo "$p" | jq -r '.[0].id // .id // "ok"')"
  else
    echo "   Auth create failed (maybe exists). Response:"
    echo "$res"
    echo "   NOTE: If user already exists, you can manually update role in profiles or implement a user lookup."
  fi
}

# ---------------------------
# Password ENV mapping (DO NOT COMMIT real values)
# ---------------------------
# APP_OWNER
create_or_report "md@britiumventures.com"        "APP_OWNER"   "PW_APP_OWNER_1" false
create_or_report "mgkyawwanna@gmail.com"         "APP_OWNER"   "PW_APP_OWNER_2" false

# SUPER_ADMIN
create_or_report "md@britiumexpress.com"         "SUPER_ADMIN" "PW_SUPER_ADMIN_1" false
create_or_report "sai@britiumexpress.com"        "SUPER_ADMIN" "PW_SUPER_ADMIN_2" false

# ADMIN
create_or_report "hod@britiumexpress.com"        "ADMIN"       "PW_ADMIN_1" false

# DEMO USERS (default password, must change)
create_or_report "customer_demo@britiumexpress.com"          "CUSTOMER"        "PW_DEFAULT_DEMO" true
create_or_report "dataentry_demo@britiumexpress.com"         "DATA_ENTRY"      "PW_DEFAULT_DEMO" true
create_or_report "finance_cashier_demo@britiumexpress.com"   "FINANCE_CASHIER" "PW_DEFAULT_DEMO" true
create_or_report "finance_senior_demo@britiumexpress.com"    "FINANCE_SENIOR"  "PW_DEFAULT_DEMO" true
create_or_report "merchant_demo@britiumexpress.com"          "MERCHANT"        "PW_DEFAULT_DEMO" true
create_or_report "opt_mgr_demo@britiumexpress.com"           "OPT_MGR"         "PW_DEFAULT_DEMO" true
create_or_report "rider_demo@britiumexpress.com"             "RIDER"           "PW_DEFAULT_DEMO" true
create_or_report "supervisor_demo@britiumexpress.com"        "SUPERVISOR"      "PW_DEFAULT_DEMO" true
create_or_report "warehouse_demo@britiumexpress.com"         "WAREHOUSE"       "PW_DEFAULT_DEMO" true

echo "✅ Done."
echo "EN: Ensure your app forces password change when profiles.must_change_password=true"
echo "MM: profiles.must_change_password=true ဖြစ်လျှင် app ထဲမှာ password change ကို မဖြစ်မနေခိုင်းပါ"