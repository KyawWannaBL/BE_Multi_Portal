import { Package, Phone, Mail } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function Header() {
  return (
    <header className="bg-navy-900/90 backdrop-blur border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-navy-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Britium Express</h1>
            <p className="text-sm text-gold-400">Premium Logistics Solutions</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-gray-300 text-sm">
          <span className="flex items-center gap-2">
            <Phone size={14} /> +95-9-897447744
          </span>
          <span className="flex items-center gap-2">
            <Mail size={14} /> info@britiumexpress.com
          </span>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}