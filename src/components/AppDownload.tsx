import React from 'react';
import { Download } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function AppDownload() {
  // The exact production URL where your APK is hosted
  const apkUrl = "https://www.britiumexpress.app/britium-express-v1.apk";

  return (
    <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all">
      <div className="flex items-center gap-4 w-full">
        {/* Scannable QR Code */}
        <div className="p-2 bg-white rounded-xl shadow-lg ring-4 ring-emerald-500/20">
          <QRCode value={apkUrl} size={64} level="H" />
        </div>
        
        <div className="flex-1">
          <p className="text-white font-black uppercase tracking-tighter text-lg">Britium Mobile</p>
          <p className="text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-widest">Scan to Install • Android v1.0.2</p>
        </div>
      </div>

      {/* Manual Download Button for Desktop browsers */}
      <a 
        href="/britium-express-v1.apk" 
        download 
        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-4 px-8 rounded-xl transition-all shadow-lg w-full sm:w-auto"
      >
        <Download className="h-4 w-4" /> DOWNLOAD
      </a>
    </div>
  );
}
