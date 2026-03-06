// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = (import.meta.env.VITE_SUPABASE_PROJECT_URL || import.meta.env.VITE_SUPABASE_URL || "https://dltavabvjwocknkyvwgz.supabase.co") as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo") as string;
export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);
export function getRememberMe(): boolean { if (typeof window === "undefined") return true; const v = window.localStorage.getItem("be_remember_me"); return v === null ? true : v === "1"; }
export function setRememberMe(remember: boolean): void { if (typeof window === "undefined") return; window.localStorage.setItem("be_remember_me", remember ? "1" : "0"); }
const hybridStorage = {
  getItem: (key: string) => typeof window !== "undefined" ? (getRememberMe() ? window.localStorage.getItem(key) : window.sessionStorage.getItem(key)) : null,
  setItem: (key: string, value: string) => { if (typeof window !== "undefined") (getRememberMe() ? window.localStorage : window.sessionStorage).setItem(key, value); },
  removeItem: (key: string) => { if (typeof window !== "undefined") { window.localStorage.removeItem(key); window.sessionStorage.removeItem(key); } },
};
function stubQuery() { const chain: any = {}; const ret = () => chain; chain.select = ret; chain.eq = ret; chain.neq = ret; chain.in = ret; chain.order = ret; chain.limit = ret; chain.maybeSingle = async () => ({ data: null, error: { message: "Not configured" } }); chain.single = async () => ({ data: null, error: { message: "Not configured" } }); return chain; }
function createStubClient() { return { auth: { getSession: async () => ({ data: { session: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1" }, error: null }) } }, from: () => stubQuery() } as any; }
export const supabase: any = SUPABASE_CONFIGURED ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: hybridStorage as any } }) : createStubClient();
