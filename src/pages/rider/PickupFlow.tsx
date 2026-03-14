export default function PickupFlow() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 md:p-24">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-[1px] w-16 bg-zinc-900" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-400">Step 01 / Registry</span>
        </div>

        <h2 className="text-5xl font-serif text-zinc-900 mb-12 leading-tight">Secure the <br/>Consignment.</h2>

        <div className="space-y-12">
          <div className="group relative">
            <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-4 block">Tamper Tag Identifier</label>
            <input 
              className="w-full bg-transparent border-b border-zinc-200 py-4 text-2xl font-light placeholder:text-zinc-200 focus:border-zinc-900 outline-none transition-all" 
              placeholder="Awaiting Scan..."
            />
            <QrCode className="absolute right-0 bottom-4 h-6 w-6 text-zinc-300 group-focus-within:text-[#D4AF37] transition-colors" />
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-zinc-50">
            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-4">Mandatory Verification</p>
            <p className="text-zinc-600 text-lg font-light leading-relaxed">
              Ensure the tamper-proof seal is captured under direct lighting. Evidence will be GPS-locked.
            </p>
          </div>

          <button className="w-full py-6 bg-zinc-900 text-white rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all text-xs font-bold tracking-[0.2em] uppercase">
            Proceed to Evidence Capture
          </button>
        </div>
      </div>
    </div>
  );
}