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

/**
 * DevTools Diagnostics Hook (EN/MM)
 * ----------------------------------------------------------------------------
 * EN: Use in browser console:  await window.__SUPABASE_SELFTEST__()
 * MY: Browser console မှာ:     await window.__SUPABASE_SELFTEST__() လို့ စမ်းပါ။
 */
// @ts-ignore
if (typeof window !== "undefined") {
  // @ts-ignore
  window.__SUPABASE_SELFTEST__ = async () => {
    const r = await supabaseSelfTest();
    // @ts-ignore
    console.log("[SUPABASE_URL]", (import.meta?.env?.VITE_SUPABASE_URL || import.meta?.env?.VITE_SUPABASE_PROJECT_URL || "MISSING"));
    // @ts-ignore
    console.log("[SUPABASE_CONFIGURED]", SUPABASE_CONFIGURED, r);
    return r;
  };
}
