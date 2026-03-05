export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#05080F] text-white">
      <div className="max-w-md w-full border border-rose-500/30 rounded-2xl p-6 bg-black/40 text-center">
        <h1 className="text-sm font-black tracking-widest uppercase text-rose-400">Unauthorized</h1>
        <p className="text-xs opacity-80 mt-2">Access denied by RBAC policy.</p>
      </div>
    </div>
  );
}
