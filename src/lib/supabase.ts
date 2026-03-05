import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dltavabvjwocknkyvwgz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo";

export const getRememberMe = () => localStorage.getItem("be_remember_me") !== "0";
export const setRememberMe = (val: boolean) => localStorage.setItem("be_remember_me", val ? "1" : "0");

const hybridStorage = {
  getItem: (key: string) => getRememberMe() ? localStorage.getItem(key) : sessionStorage.getItem(key),
  setItem: (key: string, v: string) => (getRememberMe() ? localStorage : sessionStorage).setItem(key, v),
  removeItem: (key: string) => { localStorage.removeItem(key); sessionStorage.removeItem(key); }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: hybridStorage as any, autoRefreshToken: true, persistSession: true }
});
