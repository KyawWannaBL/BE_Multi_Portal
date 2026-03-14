import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Map, Truck, Navigation, FileText, 
  Download, Activity, CheckCircle2, ShieldAlert,
  Printer, ArrowRight, Package
} from 'lucide-react';

interface WayPlan {
  tripId: string;
  driverName: string;
  vehiclePlate: string;
  origin: string;
  destination: string;
  status: 'LOADING' | 'IN_TRANSIT' | 'ARRIVED';
  totalParcels: number;
  totalWeight: number;
  totalCod: number;
  departureTime: string;
  awbList: { awb: string; recipient: string; weight: number; cod: number }[];
}

export default function LogisticsMonitoringPage() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  // Mock Active Way Plans (Line-Haul Trips)
  const [activePlans] = useState<WayPlan[]>([
    {
      tripId: 'TRP-YGN-MDY-001', driverName: 'U Aung Tun', vehiclePlate: 'YGN-9Q-1234',
      origin: 'Yangon (Main Hub)', destination: 'Mandalay (Branch A)',
      status: 'IN_TRANSIT', totalParcels: 145, totalWeight: 320.5, totalCod: 1450000,
      departureTime: 'Today, 08:30 AM',
      awbList: [
        { awb: 'BE82719283MM', recipient: 'Kyaw Kyaw', weight: 2.5, cod: 45000 },
        { awb: 'BE82719284MM', recipient: 'Daw Mya', weight: 1.0, cod: 12000 },
        { awb: 'BE82719285MM', recipient: 'Tech Store MDY', weight: 15.0, cod: 350000 },
      ]
    },
    {
      tripId: 'TRP-YGN-NPT-002', driverName: 'Ko Zaw', vehiclePlate: 'YGN-3E-9988',
      origin: 'Yangon (Main Hub)', destination: 'Naypyitaw (HQ)',
      status: 'LOADING', totalParcels: 88, totalWeight: 150.0, totalCod: 890000,
      departureTime: 'Pending',
      awbList: [
        { awb: 'BE99819283MM', recipient: 'Ministry Dept 1', weight: 5.0, cod: 0 },
        { awb: 'BE99819284MM', recipient: 'U Ba', weight: 3.5, cod: 25000 },
      ]
    }
  ]);

  const [selectedPlan, setSelectedPlan] = useState<WayPlan | null>(activePlans[0]);

  // 🖨️ A4 Way Plan Report Generator
  const generateWayPlanReport = (plan: WayPlan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate table rows dynamically
    const tableRows = plan.awbList.map((item, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #000; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #000; font-weight: bold;">${item.awb}</td>
        <td style="padding: 8px; border: 1px solid #000;">${item.recipient}</td>
        <td style="padding: 8px; border: 1px solid #000; text-align: center;">${item.weight} kg</td>
        <td style="padding: 8px; border: 1px solid #000; text-align: right;">${item.cod.toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #000;"></td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Way Plan Report - ${plan.tripId}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; }
            .subtitle { font-size: 12px; color: #555; text-transform: uppercase; letter-spacing: 2px; }
            .meta-grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
            .meta-box { border: 1px solid #000; padding: 10px; width: 48%; box-sizing: border-box; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
            th { background-color: #f0f0f0; padding: 10px; border: 1px solid #000; text-transform: uppercase; }
            .footer { display: flex; justify-content: space-between; margin-top: 50px; }
            .signature-box { text-align: center; width: 30%; }
            .signature-line { border-bottom: 1px solid #000; height: 50px; margin-bottom: 10px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          
          <div class="header">
            <h1 class="title">BRITIUM EXPRESS</h1>
            <p class="subtitle">Official Way Plan & Cargo Manifest</p>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <p><strong>TRIP ID:</strong> ${plan.tripId}</p>
              <p><strong>ROUTE:</strong> ${plan.origin} ➔ ${plan.destination}</p>
              <p><strong>DATE/TIME:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="meta-box">
              <p><strong>DRIVER:</strong> ${plan.driverName}</p>
              <p><strong>VEHICLE:</strong> ${plan.vehiclePlate}</p>
              <p><strong>TOTAL CARGO:</strong> ${plan.totalParcels} Parcels (${plan.totalWeight} kg)</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Waybill (AWB)</th>
                <th>Recipient</th>
                <th>Weight</th>
                <th>COD (MMK)</th>
                <th>Remarks / Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr>
                <td colspan="4" style="padding: 10px; border: 1px solid #000; text-align: right; font-weight: bold;">TOTAL COD TO COLLECT:</td>
                <td colspan="2" style="padding: 10px; border: 1px solid #000; font-weight: bold;">${plan.totalCod.toLocaleString()} MMK</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p><strong>Dispatched By (Hub Manager)</strong></p>
              <p>Sign & Date</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p><strong>Received By (Driver)</strong></p>
              <p>Sign & Date</p>
            </div>
          </div>

        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 p-8 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-500" />
            {t('Logistics Monitoring', 'ကုန်စည်စီမံမှုနှင့် လမ်းကြောင်းခြေရာခံခြင်း')}
          </h1>
          <p className="text-xs text-emerald-500 mt-2 tracking-[0.2em] font-bold uppercase">Live Way Plan & Cargo Tracking</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        
        {/* LEFT PANE: Active Routes / Line-Hauls */}
        <div className="xl:col-span-5 flex flex-col space-y-6">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col h-full">
            <h2 className="text-sm font-black tracking-widest uppercase text-gray-400 mb-6 flex items-center gap-2">
              <Map className="h-4 w-4 text-emerald-500" /> {t('Active Way Plans', 'လက်ရှိသွားနေသော လမ်းကြောင်းများ')}
            </h2>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {activePlans.map((plan) => (
                <button 
                  key={plan.tripId}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    selectedPlan?.tripId === plan.tripId 
                      ? 'bg-emerald-600/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-[#0A0F1C] border-white/5 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`font-black tracking-wider uppercase ${selectedPlan?.tripId === plan.tripId ? 'text-emerald-400' : 'text-white'}`}>
                      {plan.tripId}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border ${
                      plan.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      plan.status === 'LOADING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-gray-800 text-gray-400 border-gray-600'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    {plan.origin} <ArrowRight className="h-3 w-3 text-emerald-500" /> {plan.destination}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Truck className="h-4 w-4 text-gray-500" /> {plan.vehiclePlate}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400"><Package className="h-4 w-4 text-gray-500" /> {plan.totalParcels} Parcels</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Tracking Details & Report Generator */}
        <div className="xl:col-span-7 space-y-6">
          {selectedPlan ? (
            <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
              
              {/* Report Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-widest text-white uppercase">{selectedPlan.tripId}</h2>
                  <p className="text-sm text-gray-500 mt-2 font-mono flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Driver: {selectedPlan.driverName} | {selectedPlan.vehiclePlate}
                  </p>
                </div>
                <button 
                  onClick={() => generateWayPlanReport(selectedPlan)}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center gap-3 text-xs font-black uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  <Printer className="h-5 w-5" /> {t('Print A4 Way Plan', 'A4 လမ်းကြောင်းအစီရင်ခံစာ ထုတ်မည်')}
                </button>
              </div>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0A0F1C] p-5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Weight</p>
                  <p className="text-2xl font-black text-white mt-1">{selectedPlan.totalWeight} <span className="text-sm text-gray-500">kg</span></p>
                </div>
                <div className="bg-[#0A0F1C] p-5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Cargo</p>
                  <p className="text-2xl font-black text-white mt-1">{selectedPlan.totalParcels} <span className="text-sm text-gray-500">AWBs</span></p>
                </div>
                <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Expected COD</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{selectedPlan.totalCod.toLocaleString()} <span className="text-sm">MMK</span></p>
                </div>
              </div>

              {/* Cargo List */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-xs font-black tracking-widest uppercase text-gray-400 mb-4">{t('Loaded Cargo Manifest', 'တင်ဆောင်ထားသော ကုန်ပစ္စည်းစာရင်း')}</h3>
                <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-[#0A0F1C]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0E1525] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 sticky top-0">
                      <tr>
                        <th className="p-4">AWB</th>
                        <th className="p-4">Recipient</th>
                        <th className="p-4 text-center">Weight</th>
                        <th className="p-4 text-right">COD (MMK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedPlan.awbList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{item.awb}</td>
                          <td className="p-4 text-gray-300">{item.recipient}</td>
                          <td className="p-4 text-center text-gray-400">{item.weight} kg</td>
                          <td className="p-4 text-right font-bold text-emerald-400">{item.cod.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Note: The UI trims the list for preview. The full list is sent to the printer. */}
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                          {selectedPlan.totalParcels > 3 ? `+ ${selectedPlan.totalParcels - 3} more items hidden in preview. Visible on print.` : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full bg-[#0E1525] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-600 space-y-4">
              <Map className="h-16 w-16 opacity-20" />
              <p className="text-xs font-bold tracking-widest uppercase">Select a Way Plan to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
