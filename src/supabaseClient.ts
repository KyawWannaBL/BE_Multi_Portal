import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  "") as string;

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function configError() {
  return { name: "SupabaseConfigError", message: "Supabase env is missing." };
}

function createStubClient() {
  const auth = {
    getSession: async () => ({ data: { session: null }, error: configError() }),
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: configError() }),
    signInWithOtp: async () => ({ data: { session: null, user: null }, error: configError() }),
    verifyOtp: async () => ({ data: { session: null, user: null }, error: configError() }),
    signUp: async () => ({ data: { session: null, user: null }, error: configError() }),
    resetPasswordForEmail: async () => ({ data: null, error: configError() }),
    updateUser: async () => ({ data: { user: null }, error: configError() }),
    signOut: async () => ({ data: null, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: null }, error: configError() }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    mfa: {
      getAuthenticatorAssuranceLevel: async () => ({
        data: { currentLevel: "aal1", nextLevel: "aal1" },
        error: configError(),
      }),
      listFactors: async () => ({ data: { all: [] }, error: configError() }),
    },
  };

  const query = () => ({
    select() { return this; },
    insert() { return this; },
    update() { return this; },
    upsert() { return this; },
    delete() { return this; },
    eq() { return this; },
    order() { return this; },
    limit() { return this; },
    single: async () => ({ data: null, error: configError() }),
    maybeSingle: async () => ({ data: null, error: configError() }),
  });

  return {
    auth,
    from: query,
    rpc: async () => ({ data: null, error: configError() }),
    storage: { from: () => ({}) },
  };
}

export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createStubClient();

if (!isSupabaseConfigured) {
  console.warn("[supabase] Missing VITE_SUPABASE_PROJECT_URL/VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}
