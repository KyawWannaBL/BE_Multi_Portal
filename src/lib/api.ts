import { supabase } from "@/supabaseClient";

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  const res = await fetch(input, { ...init, headers });

  // If backend enforces rotation: return 403 with a machine code.
  if (res.status === 403) {
    try {
      const cloned = res.clone();
      const body = await cloned.json();
      if (body?.code === "PASSWORD_ROTATION_REQUIRED") {
        window.location.assign("/security-update");
      }
    } catch {
      // ignore non-json
    }
  }

  return res;
}
