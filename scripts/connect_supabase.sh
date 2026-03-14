#!/usr/bin/env bash
set -euo pipefail

echo "🔌 Connecting project to Supabase (EN/MM)"
echo "🔌 Project ကို Supabase နဲ့ ချိတ်ဆက်နေသည် (EN/MM)"

# -----------------------------------------------------------------------------
# EN: Install Supabase JS client
# MY: Supabase JS client ကို install လုပ်
# -----------------------------------------------------------------------------
npm install --save @supabase/supabase-js --no-fund --no-audit

mkdir -p src/lib src/services

# -----------------------------------------------------------------------------
# EN: Create env templates
# MY: env template ဖိုင်များ ဖန်တီး
# -----------------------------------------------------------------------------
cat > .env.example <<'EOF'
# EN: Copy to .env.local for local dev. Add same vars in Vercel Project Settings.
# MY: Local dev အတွက် .env.local ကို copy လုပ်ပါ။ Vercel Environment Variables မှာလည်း ထည့်ပါ။

VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
EOF

if [ ! -f .env.local ]; then
  cat > .env.local <<'EOF'
# EN: Local dev only. DO NOT COMMIT.
# MY: Local dev အတွက်သာ။ Git ထဲမတင်ပါနှင့်။

VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
EOF
  echo "✅ Created .env.local (edit it with your real keys) / .env.local ဖန်တီးပြီးပါပြီ (key ထည့်ပါ)"
else
  echo "ℹ️ .env.local already exists / .env.local ရှိပြီးသား"
fi

# -----------------------------------------------------------------------------
# EN: Supabase client (single source of truth)
# MY: Supabase client တစ်ခုတည်းသုံးရန် (အဓိကဖိုင်)
# -----------------------------------------------------------------------------
cat > src/lib/supabase.ts <<'EOF'
// @ts-nocheck
/**
 * Supabase Client (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Single source of truth for Supabase connection used across the app.
 * MY: App တစ်ခုလုံးမှာ သုံးမည့် Supabase connection (single source) ဖြစ်သည်။
 */

import { createClient } from "@supabase/supabase-js";

// EN: Vite environment variables
// MY: Vite env var များ
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_PROJECT_URL ||
    "") as string;

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

// EN: Remember-me storage switch (localStorage vs sessionStorage)
// MY: Remember-me အတွက် localStorage / sessionStorage ပြောင်းနိုင်အောင်
const REMEMBER_KEY = "be_remember_me";

export function getRememberMe(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(REMEMBER_KEY);
  return v === null ? true : v === "1";
}

export function setRememberMe(remember: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
}

const hybridStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    return getRememberMe()
      ? window.localStorage.getItem(key)
      : window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    (getRememberMe() ? window.localStorage : window.sessionStorage).setItem(
      key,
      value
    );
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

// EN: Build-safe stub client if env is missing (prevents white-screen build failures)
// MY: env မရှိရင် build မပျက်အောင် stub client ထုတ်ပေး
type StubError = { message: string; code?: string };
function stubError(message = "Supabase is not configured."): StubError {
  return { message, code: "SUPABASE_NOT_CONFIGURED" };
}

function stubQuery() {
  const chain: any = {};
  const ret = () => chain;
  chain.select = ret; chain.eq = ret; chain.neq = ret; chain.in = ret; chain.order = ret; chain.limit = ret;
  chain.maybeSingle = async () => ({ data: null, error: stubError() });
  chain.single = async () => ({ data: null, error: stubError() });
  chain.insert = async () => ({ data: null, error: stubError() });
  chain.update = async () => ({ data: null, error: stubError() });
  chain.delete = async () => ({ data: null, error: stubError() });
  chain.upsert = async () => ({ data: null, error: stubError() });
  return chain;
}

function createStubClient() {
  const noopSub = { unsubscribe: () => {} };
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: stubError() }),
      onAuthStateChange: () => ({ data: { subscription: noopSub } }),
      signInWithPassword: async () => ({ data: null, error: stubError() }),
      signInWithOtp: async () => ({ data: null, error: stubError() }),
      verifyOtp: async () => ({ data: null, error: stubError() }),
      signUp: async () => ({ data: null, error: stubError() }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: stubError() }),
      updateUser: async () => ({ data: null, error: stubError() }),
      getUser: async () => ({ data: { user: null }, error: stubError() }),
      exchangeCodeForSession: async () => ({ data: null, error: stubError() }),
      setSession: async () => ({ data: null, error: stubError() }),
      mfa: {
        getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal2" }, error: stubError() }),
        listFactors: async () => ({ data: { all: [], totp: [] }, error: stubError() }),
        enroll: async () => ({ data: null, error: stubError() }),
        challenge: async () => ({ data: null, error: stubError() }),
        verify: async () => ({ data: null, error: stubError() }),
      },
    },
    from: () => stubQuery(),
  } as any;
}

export const supabase: any = SUPABASE_CONFIGURED
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: hybridStorage as any,
      },
    })
  : createStubClient();

// EN: Quick self-check helper (call in browser console)
// MY: Browser console ထဲကနေ test လုပ်လို့ရအောင် helper
export async function supabaseSelfTest() {
  if (!SUPABASE_CONFIGURED) {
    return { ok: false, reason: "ENV_MISSING", supabaseUrl };
  }
  const { data, error } = await supabase.auth.getSession();
  return { ok: !error, session: data?.session ?? null, error: error?.message ?? null };
}
EOF

# -----------------------------------------------------------------------------
# EN: Helper used by service files (assertOk)
# MY: Services တွေမှာ သုံးတဲ့ helper (assertOk)
# -----------------------------------------------------------------------------
cat > src/services/supabaseHelpers.ts <<'EOF'
// @ts-nocheck
/**
 * Supabase Helpers (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Small helpers for consistent error handling.
 * MY: Error handling ကို တစ်ပုံစံတည်းထားဖို့ helper များ။
 */

export function assertOk(res: any, ctx = "SUPABASE_CALL") {
  if (!res) throw new Error(`${ctx}: empty response`);
  if (res.error) {
    const msg = res.error.message || String(res.error);
    throw new Error(`${ctx}: ${msg}`);
  }
  return res.data;
}
EOF

echo ""
echo "✅ Supabase connection files created/updated (EN/MM)."
echo "✅ Supabase ချိတ်ဆက်ဖိုင်များ ပြင်ဆင်ပြီးပါပြီ (EN/MM)."
echo ""
echo "NEXT STEPS (IMPORTANT):"
echo "1) Edit .env.local with real VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY"
echo "2) Add same env vars in Vercel Project Settings → Environment Variables"
echo "3) Supabase Dashboard → Auth → URL Configuration:"
echo "   - Site URL: https://britiumexpress.com"
echo "   - Redirect URLs: https://britiumexpress.com/login , https://britiumexpress.com/reset-password"
echo ""
echo "After that run:"
echo "  npm run build"
