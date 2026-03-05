import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, Search, Filter, Download, 
  MapPin, Phone, Truck, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';

export default function Ways() {
  const { t } = useLanguageContext();
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchWays = async () => {
      setIsLoading(true);
      // Fetching from the SECURE view we created in SQL
      const { data, error } = await supabase
        .from('secure_shipments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Pagination limit for high-density rendering
      
      if (!error && data) {
        setShipments(data);
      }
      setIsLoading(false);
    };

    fetchWays();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle className="w-3 h-3" /> };
      case 'transit': return { color: 'text-gold-400 bg-gold-400/10 border-gold-400/20', icon: <Truck className="w-3 h-3" /> };
      case 'failed': return { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: <AlertCircle className="w-3 h-3" /> };
      default: return { color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: <Clock className="w-3 h-3" /> };
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.tracking_no?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.receiver_phone?.includes(searchQuery)
  );

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
            <Package className="h-8 w-8 text-emerald-500" />
            {t('Logistics Operations', 'ပို့ဆောင်ရေး လုပ်ငန်းစဉ်များ')}
          </h1>
          <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-widest">
            {t('Live Tracking Grid', 'အချိန်နှင့်တပြေးညီ ပို့ဆောင်မှုစာရင်း')} • {shipments.length} {t('Records', 'ခု')}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder={t('Search Tracking or Phone...', 'ရှာဖွေရန်...')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#05080F] border-white/10 text-white pl-10 h-12 rounded-xl focus-visible:ring-emerald-500/50 font-mono text-sm"
            />
          </div>
          <Button variant="outline" className="h-12 border-white/10 bg-[#05080F] text-white hover:bg-white/5 rounded-xl">
            <Filter className="w-4 h-4 mr-2 text-slate-400" /> {t('Filter', 'စစ်ထုတ်ရန်')}
          </Button>
          <Button className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6">
            <Download className="w-4 h-4 mr-2" /> {t('Export', 'ထုတ်ယူမည်')}
          </Button>
        </div>
      </div>

      {/* HIGH-DENSITY DATA GRID */}
      <Card className="border-none rounded-[2rem] bg-[#05080F] overflow-hidden shadow-2xl ring-1 ring-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-slate-400 uppercase font-black text-[10px] tracking-widest">
              <tr>
                <th className="px-8 py-5 rounded-tl-[2rem]">{t('Tracking ID', 'ပို့ဆောင်မှုအမှတ်')}</th>
                <th className="px-8 py-5">{t('Status', 'အခြေအနေ')}</th>
                <th className="px-8 py-5">{t('Receiver', 'လက်ခံမည့်သူ')}</th>
                <th className="px-8 py-5">{t('Contact', 'ဖုန်းနံပါတ်')}</th>
                <th className="px-8 py-5 text-right rounded-tr-[2rem]">{t('COD Amount', 'ကောက်ခံငွေ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-mono animate-pulse">
                    LOADING_SECURE_DATA...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold">
                    {t('No shipments found.', 'ပို့ဆောင်မှု မှတ်တမ်းမရှိပါ။')}
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const status = getStatusConfig(shipment.status);
                  return (
                    <tr key={shipment.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-4">
                        <span className="font-mono font-black text-white text-base tracking-tight group-hover:text-emerald-400 transition-colors cursor-pointer">
                          {shipment.tracking_no}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border font-black text-[10px] uppercase tracking-wider ${status.color}`}>
                          {status.icon}
                          {shipment.status || 'PENDING'}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-slate-300 font-bold">
                          <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-slate-400">
                            <MapPin className="h-3 w-3" />
                          </div>
                          {shipment.receiver_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                          <Phone className="h-3 w-3" />
                          {/* This is securely masked by PostgreSQL if the user is not L4/L5 */}
                          {shipment.receiver_phone}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="font-mono font-black text-emerald-500 text-base">
                          {Number(shipment.cod_amount).toLocaleString()} <span className="text-xs text-slate-500">K</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
