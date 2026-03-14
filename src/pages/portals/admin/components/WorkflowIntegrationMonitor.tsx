import React from "react";
import {
  QrCode,
  PenSquare,
  MapPinned,
  Camera,
  ShieldCheck
} from "lucide-react";

export default function WorkflowIntegrationMonitor() {
  const cards = [
    { title: "QR Workflow", desc: "QR prepare / verify integration ready", icon: <QrCode size={18} className="text-emerald-400" /> },
    { title: "Signature Workflow", desc: "Electronic signature save flow ready", icon: <PenSquare size={18} className="text-blue-400" /> },
    { title: "Mapbox Workflow", desc: "Location capture / route sync ready", icon: <MapPinned size={18} className="text-amber-400" /> },
    { title: "Parcel Photo Workflow", desc: "Photo capture / OCR / blur-check ready", icon: <Camera size={18} className="text-rose-400" /> },
    { title: "Workflow Security", desc: "Enterprise workflow orchestration ready", icon: <ShieldCheck size={18} className="text-cyan-400" /> },
  ];

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-black uppercase tracking-widest text-white">
        Workflow Integration Monitor
      </h2>
      <p className="mt-2 text-sm text-gray-400">
        QR Code, Scanning, Signature Pad, MapBox and Parcel Photo flow integration status.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-white/10 bg-[#0A0E17] p-5">
            <div className="mb-3">{card.icon}</div>
            <div className="text-white font-black uppercase text-sm">{card.title}</div>
            <div className="mt-2 text-xs text-gray-400">{card.desc}</div>
            <div className="mt-4 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase text-emerald-300">
              Integrated
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
