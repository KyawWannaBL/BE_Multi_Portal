import { Package, Phone, Mail } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { bi } = useLanguage();

  return (
    <header className="bg-navy-900/90 backdrop-blur border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-navy-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Britium Express</h1>
            <p className="text-sm text-gold-400">
              {bi("Premium Logistics Solutions", "အရည်အသွေးမြင့် ပို့ဆောင်ရေး ဝန်ဆောင်မှု")}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-gray-300 text-sm">
          <span className="flex items-center gap-2">
            <Phone size={14} /> +95-9-897447744
          </span>
          <span className="flex items-center gap-2">
            <Mail size={14} /> info@britiumexpress.com
          </span>
          <NotificationBell />
          <LanguageToggle />
        </div>

        <div className="md:hidden">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
