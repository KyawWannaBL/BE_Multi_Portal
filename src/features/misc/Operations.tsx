import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth"; 
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  Truck, 
  Download, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function Operations() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Logic: Check if user is an Individual Sender
  const isIndividual = role === 'CUSTOMER' || role === 'INDIVIDUAL_SENDER';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setIdFile(e.target.files[0]);
  };

  return (
    <div className="space-y-6 text-slate-100 p-4">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Shipment Registration
          </h1>
          <p className="text-slate-400 mt-1">Register new parcels or upload manifests in bulk.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'single' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Single Entry
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bulk' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Bulk CSV
          </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- FORM SECTION --- */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'single' ? (
            <div className="luxury-glass p-8 rounded-2xl border border-slate-700/50 space-y-8">
              
              {/* Sender Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Truck size={20} />
                  <h3 className="font-semibold uppercase tracking-wider text-sm">Sender Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={user?.user_metadata?.full_name} />
                  <Input label="Contact Number" placeholder="+95 ..." />
                  <div className="md:col-span-2">
                    <Input label="Pickup Address" placeholder="Street, Township, City" />
                  </div>
                </div>
              </section>

              {/* Identity Verification */}
              {isIndividual && (
                <section className="p-6 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ShieldCheck size={20} />
                    <h3 className="font-semibold text-sm">IDENTITY VERIFICATION REQUIRED</h3>
                  </div>
                  <p className="text-xs text-slate-400">As an individual sender, you must upload a copy of your National ID/NRC to proceed.</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="text-slate-500 mb-2" />
                      <p className="text-sm text-slate-400">{idFile ? idFile.name : 'Click to upload National ID (JPG/PDF)'}</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </section>
              )}

              {/* Receiver Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <FileText size={20} />
                  <h3 className="font-semibold uppercase tracking-wider text-sm">Receiver Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Recipient Name" placeholder="Full Name" />
                  <Input label="Contact Number" placeholder="+95 ..." />
                  <div className="md:col-span-2">
                    <Input label="Delivery Address" placeholder="Street, Township, City" />
                  </div>
                </div>
              </section>

              {/* Policy & Submit */}
              <div className="pt-6 border-t border-slate-700/50 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    I agree to follow Britium Ventures policy regarding restricted cargoes.
                  </span>
                </label>
                
                <button 
                  disabled={!agreed || (isIndividual && !idFile)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Confirm Registration & Generate Waybill
                </button>
              </div>
            </div>
          ) : (
            /* Bulk Upload Section */
            <div className="luxury-glass p-8 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Upload className="text-emerald-500" size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">Bulk Manifest Upload</h2>
                <p className="text-slate-400 mt-2">Upload your shipment manifest CSV to process multiple parcels.</p>
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">
                  <Download size={18} />
                  Download Template
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-colors">
                  Select CSV File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- SIDEBAR --- */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
            <h4 className="flex items-center gap-2 text-blue-400 font-bold mb-4">
              <AlertCircle size={18} />
              Registration Policy
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2"><span>•</span> Standard labels are 4" x 6" A4 PDF.</li>
              <li className="flex gap-2"><span>•</span> QR codes include Waybill ID & JSON data.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <input 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        {...props}
      />
    </div>
  );
}