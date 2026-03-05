import React, { useState } from 'react';
import { useLanguageContext } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet, Map, Barcode, QrCode, Download, Weight } from 'lucide-react';

export default function ReportsHub() {
  const { t } = useLanguageContext();
  const [isPrinting, setIsPrinting] = useState(false);

  // Simulated Waybill Data following your AWB.png structure
  const currentAWB = {
    trackingNo: "YGN119874YGN",
    recipient: "N Okkalapa",
    phones: "09792970776, 09792970776",
    name: "ဖြိုးမြတ်မြတ်ကျော်",
    itemPrice: "25,000",
    deliveryFees: "3,000",
    prepaid: "0",
    cod: "28,000",
    weight: "1.5 kg"
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-10 space-y-8 bg-[#0B101B] min-h-screen text-slate-300 print:bg-white print:p-0">
      
      {/* CONTROL INTERFACE (HIDDEN DURING PRINT) */}
      <div className="flex justify-between items-end bg-[#05080F] p-10 rounded-[3rem] border border-white/5 shadow-2xl print:hidden">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
            <Printer className="h-10 w-10 text-emerald-500" />
            {t('WB Precision Engine', 'ပို့ဆောင်လွှာ')}
          </h1>
          <p className="text-emerald-500 font-mono text-xs mt-2 tracking-widest uppercase">
            THERMAL_PRINT_4X6_READY • MAPBOX_WAY_PLANNING
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-white/10 text-white h-12 px-6 rounded-xl font-black">
            <FileSpreadsheet className="mr-2 h-5 w-5" /> {t('Export Stats', 'အချက်အလက်ထုတ်ယူမည်')}
          </Button>
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 rounded-xl font-black">
            <Printer className="mr-2 h-5 w-5" /> {t('Direct Print', 'ချက်ချင်းထုတ်မည်')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 print:block">
        
        {/* WAY PLANNING & STATISTICS (HIDDEN DURING PRINT) */}
        <Card className="col-span-5 rounded-[3rem] border-none shadow-2xl bg-[#05080F] ring-1 ring-white/5 print:hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl font-black text-white flex items-center gap-3">
              <Map className="text-emerald-500" /> Mapbox Way Planning
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Total Batch Weight</span>
                  <span className="text-xl font-black text-emerald-500">142.5 kg</span>
                </div>
                <div className="h-2 bg-[#0B101B] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[70%]" />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Optimizing 48 waybills into 3 primary routes via Mapbox API...</p>
             </div>
             <Button variant="ghost" className="w-full text-emerald-500 border border-emerald-500/20 h-14 rounded-2xl font-black">
                <Download className="mr-2 h-5 w-5" /> Download Statistical CSV
             </Button>
          </CardContent>
        </Card>

        {/* 4x6 THERMAL PRINT PREVIEW - MATCHING AWB.PNG */}
        <div className="col-span-7 flex justify-center print:col-span-12">
          <div id="waybill-thermal" className="w-[4in] h-[6in] bg-white text-black p-4 flex flex-col border border-gray-200 shadow-2xl relative print:border-none print:shadow-none print:m-0">
            
            {/* Header Section */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center">
                  <Barcode className="text-white h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-none">BRITIUM EXPRESS</h2>
                  <p className="text-[10px] font-bold">DELIVERY SERVICE</p>
                  <p className="text-[8px]">HotLine:</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-bold">{currentAWB.trackingNo}</p>
                <QrCode className="h-14 w-14 mx-auto" />
                <p className="text-[8px] font-bold">{currentAWB.trackingNo}</p>
              </div>
            </div>

            {/* Merchant Info */}
            <div className="text-[10px] mb-2 border-b border-gray-300 pb-1">
              <span className="font-bold">Merchant :</span>
            </div>

            {/* Recipient Info */}
            <div className="flex-1 space-y-2 border-b-2 border-black pb-2 mb-2">
              <div className="flex gap-2 text-xs">
                <span className="font-bold">Recipient :</span>
                <span className="font-black text-sm">{currentAWB.recipient}</span>
              </div>
              <p className="text-sm font-bold pl-12">{currentAWB.phones}</p>
              <p className="text-lg font-black pl-12">{currentAWB.name}</p>
              <p className="text-[10px] pl-12 text-gray-500 italic">Multiline Text</p>
            </div>

            {/* Remarks */}
            <div className="text-[10px] border-b-2 border-black pb-1 mb-2">
              <span className="font-bold">Remarks :</span>
            </div>

            {/* Financial Grid - Matching Bottom Grid of AWB.png */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between"><span>Item Price :</span> <span className="font-bold">{currentAWB.itemPrice}</span></div>
                <div className="flex justify-between"><span>Delivery Fees :</span> <span className="font-bold">{currentAWB.deliveryFees}</span></div>
                <div className="flex justify-between"><span>Prepaid Amount :</span> <span className="font-bold">{currentAWB.prepaid}</span></div>
                <div className="flex justify-between pt-1 border-t border-gray-400">
                  <span className="font-bold">Weight :</span> <span className="font-black text-emerald-700">{currentAWB.weight}</span>
                </div>
              </div>
              
              <div className="bg-gray-200 rounded-xl p-2 border-2 border-gray-400 flex flex-col justify-center items-center relative">
                <div className="absolute top-1 left-2 text-[8px] font-bold">COD</div>
                <div className="absolute top-1 right-2 text-[8px] font-bold">MMK</div>
                <span className="text-2xl font-black">{currentAWB.cod}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-2 text-center border-t border-black pt-1">
              <p className="text-[9px] font-bold leading-tight">
                အောက်ပါငွေပမာဏထက် ပိုမိုတောင်းခံပါက အထက်ပါ <br/>
                <span className="font-black">Hotline</span> သို့ ဆက်သွယ် တိုင်ကြားနိုင်ပါသည်။
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS for Printing Sizes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #waybill-thermal, #waybill-thermal * { visibility: visible; }
          #waybill-thermal {
            position: absolute;
            left: 0;
            top: 0;
            width: 4in;
            height: 6in;
          }
          @page {
            size: 4in 6in;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
