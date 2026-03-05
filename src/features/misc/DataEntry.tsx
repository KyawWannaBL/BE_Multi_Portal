import React from "react";
import { Link } from "react-router-dom";
import { ClipboardEdit, Package, Truck, Upload } from "lucide-react";

export default function DataEntry() {
  const tiles = [
    { title: "Shipment Registration", href: "/operations", icon: Truck, desc: "Create a new shipment / waybill" },
    { title: "Shipments", href: "/shipments", icon: Package, desc: "Search and manage shipment records" },
    { title: "Bulk CSV Upload", href: "/operations", icon: Upload, desc: "Upload manifest in bulk (CSV)" },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
          <ClipboardEdit className="h-5 w-5 text-white/80" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Data Entry Desk</h1>
          <p className="text-white/60 text-sm">Fast, structured entry for operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.href + t.title}
            to={t.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{t.title}</div>
                <div className="text-xs text-white/50 mt-1">{t.desc}</div>
              </div>
              <t.icon className="h-5 w-5 text-white/70" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
