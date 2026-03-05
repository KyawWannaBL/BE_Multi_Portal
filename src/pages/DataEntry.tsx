import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardEdit, Package, Truck, Upload } from "lucide-react";
import { useLanguageContext } from "@/lib/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

export default function DataEntry() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();

  const tiles = [
    { title: t('Shipment Registration', 'ပို့ဆောင်မှု မှတ်ပုံတင်ရန်'), path: "/operations/new", icon: Truck },
    { title: t('Bulk CSV Upload', 'အစုလိုက် ဒေတာတင်ရန်'), path: "/operations/bulk", icon: Upload },
    { title: t('Manage Records', 'မှတ်တမ်းများ စီမံရန်'), path: "/admin/analytics", icon: Package },
  ];

  return (
    <div className="p-8 space-y-8 bg-navy-950 min-h-screen text-white">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <ClipboardEdit className="h-6 w-6 text-gold-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('Data Entry Desk', 'ဒေတာသွင်းယူရေးဌာန')}</h1>
          <p className="text-white/40 text-sm tracking-wide uppercase">{t('Industrial Input Terminal', 'စက်မှုလုပ်ငန်းသုံး ဒေတာသွင်းစနစ်')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiles.map((t) => (
          <Card 
            key={t.path} 
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
            onClick={() => navigate(t.path)}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <t.icon className="h-10 w-10 text-white/20 group-hover:text-gold-500 transition-colors" />
              <h3 className="text-lg font-bold tracking-tight">{t.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
