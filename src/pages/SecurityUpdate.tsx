import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function SecurityUpdate() {
  const nav = useNavigate();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (p1 !== p2) return setErr("Passwords do not match.");
    if (p1.length < 12) return setErr("Password must be at least 12 characters.");

    setBusy(true);
    const { data, error } = await supabase.functions.invoke("rotate-password", {
      body: { newPassword: p1 },
    });
    setBusy(false);

    if (error || !data?.ok) {
      return setErr(data?.message || error?.message || "Security Policy Violation");
    }

    // Enforce re-login (simulates session revocation minimum)
    await supabase.auth.signOut();
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05080F] text-white p-6">
      <div className="w-full max-w-md border border-amber-500/30 rounded-2xl p-6 bg-black/40">
        <h1 className="text-sm font-black tracking-widest uppercase text-amber-400">Security Update Required</h1>
        <p className="text-xs opacity-80 mt-2">Mandatory password rotation to continue.</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm"
            type="password" placeholder="New password (min 12 chars)" value={p1}
            onChange={(e) => setP1(e.target.value)} autoComplete="new-password" />
          <input className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm"
            type="password" placeholder="Confirm new password" value={p2}
            onChange={(e) => setP2(e.target.value)} autoComplete="new-password" />
          {err && <div className="text-xs text-amber-300">{err}</div>}
          <button disabled={busy}
            className="w-full rounded-xl bg-amber-500 text-black font-black py-3 text-sm disabled:opacity-60">
            {busy ? "UPDATING…" : "UPDATE & CONTINUE"}
          </button>
        </form>
      </div>
    </div>
  );
}
