import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Layers, Download, Map, QrCode } from 'lucide-react';

export default function WaybillPrecision() {
  const { lang } = useLanguage();

  const mockWaybills = [
    { id: 'WB-9901', sender: 'Yangon Mart', receiver: 'N Okkalapa', cod: '28,000 MMK' },
    { id: 'WB-9902', sender: 'MDY Fashion', receiver: 'Chanayethazan', cod: '45,000 MMK' },
    { id: 'WB-9903', sender: 'Tech Hub', receiver: 'Nay Pyi Taw', cod: '12,500 MMK' }
  ];

  const handlePrintAll = () => {
    window.print(); // Triggers the browser print dialog for batch CSS
  };

  return (
    <div className="p-10 space-y-10 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex justify-between items-center bg-[#05080F] p-10 rounded-[3rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl"><Layers className="h-8 w-8 text-emerald-500" /></div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic">WB Precision Engine</h1>
            <p className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest">Thermal_Print_4x6_Ready • Batch_Processing_Enabled</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={handlePrintAll} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-emerald-900/20">
            <Printer className="mr-2 h-5 w-5" /> {lang === 'en' ? 'Direct Print (Batch)' : 'တစ်ပြိုင်နက် ပရင့်ထုတ်မည်'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Mapbox Way Planning (Image 5 Logic) */}
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] p-10">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Map className="text-sky-500"/> Mapbox Way Planning</h2>
          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <p className="text-slate-500 text-xs font-bold uppercase">Total Batch Weight</p>
                <p className="text-3xl font-black text-emerald-400">142.5 kg</p>
             </div>
             <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]"></div>
             </div>
             <p className="text-[10px] text-slate-500 italic">Optimizing 48 waybills into 3 primary routes via Mapbox API...</p>
             <Button variant="outline" className="w-full h-12 border-white/10 text-slate-400 rounded-xl"><Download className="mr-2 h-4 w-4"/> Download Statistical CSV</Button>
          </div>
        </Card>

        {/* Live Label Previews */}
        <div className="space-y-6">
          {mockWaybills.map((wb) => (
            <div key={wb.id} className="bg-white p-6 rounded-xl flex gap-6 text-black print:m-0 print:shadow-none print:w-[4in] print:h-[6in]">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start border-b border-black pb-2">
                   <p className="font-black text-lg">BRITIUM EXPRESS</p>
                   <p className="font-mono text-[8px]">{wb.id}</p>
                </div>
                <div className="text-[10px] space-y-1">
                  <p><strong>Merchant:</strong> {wb.sender}</p>
                  <p><strong>Recipient:</strong> {wb.receiver}</p>
                  <p className="font-black text-lg mt-2">မြို့ဖြတ်မြတ်ကျော်</p>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center mt-4">
                  <span className="font-bold text-[10px]">COD MMK</span>
                  <span className="font-black text-lg">{wb.cod}</span>
                </div>
              </div>
              <div className="w-24 flex flex-col items-center justify-center border-l border-black/10 pl-4">
                 <QrCode size={60} />
                 <p className="text-[8px] font-mono mt-2">SCAN ME</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
