import React from "react";

type Props = {
  /** Optional: show current host origin to help debugging env injection. */
  origin?: string;
};

export default function MissingSupabaseConfig({ origin }: Props) {
  const where = origin ?? (typeof window !== "undefined" ? window.location.origin : "");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow">
        <h1 className="text-2xl font-semibold">App configuration required</h1>
        <p className="mt-2 text-white/70">
          This build is missing the Supabase environment variables required to start.
        </p>

        <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm">
          <div className="font-mono text-white/90">VITE_SUPABASE_URL</div>
          <div className="font-mono text-white/90 mt-2">VITE_SUPABASE_PUBLISHABLE_KEY</div>
        </div>

        <p className="mt-4 text-white/70 text-sm">
          Local dev: copy <span className="font-mono">.env.example</span> to{" "}
          <span className="font-mono">.env.local</span>, fill values, then run{" "}
          <span className="font-mono">npm run dev</span>.
        </p>

        <p className="mt-2 text-white/70 text-sm">
          Deployment: add the same variables in your hosting provider’s environment settings and redeploy.
        </p>

        {where ? (
          <div className="mt-4 text-xs text-white/50">
            Current origin: <span className="font-mono">{where}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
