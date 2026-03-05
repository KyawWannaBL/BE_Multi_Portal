export default function ConfigFault({ missing }: { missing: string[] }) {
  return (
    <div className="min-h-screen bg-[#05080F] text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full border border-rose-500/40 rounded-2xl p-6 bg-black/40">
        <h1 className="text-sm font-black tracking-widest uppercase text-rose-400">System Halted: Config Fault</h1>
        <p className="text-xs opacity-80 mt-2">Missing required environment variables:</p>
        <ul className="mt-3 text-xs font-mono text-rose-300 space-y-1">
          {missing.map((m) => <li key={m}>- {m}</li>)}
        </ul>
        <p className="mt-4 text-[11px] opacity-60">
          Fix your Vercel Environment Variables (Preview + Production), then redeploy.
        </p>
      </div>
    </div>
  );
}
