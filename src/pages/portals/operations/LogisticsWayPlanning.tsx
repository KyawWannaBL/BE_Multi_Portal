import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  QrCode, Image as ImageIcon, Keyboard, Printer, 
  Download, UploadCloud, Loader2, Navigation, 
  User, MapPin, Wallet, Scale, Box, CheckCircle2
} from 'lucide-react';
import WaybillThermalTemplate, { WaybillData } from '@/components/operations/WaybillThermalTemplate';

type InputMode = 'MANUAL' | 'OCR' | 'QR';
type PaymentMode = 'PREPAID_DELIVERY' | 'COLLECT_DELIVERY'; // Sender pays delivery vs Receiver pays delivery

export default function LogisticsWayPlanning() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);

  const [inputMode, setInputMode] = useState<InputMode>('MANUAL');
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<WaybillData[]>([]);

  // Batch Print Ref
  const printAreaRef = useRef<HTMLDivElement>(null);

  // --- SMART FORM STATE ---
  const [formData, setFormData] = useState({
    merchantName: '', merchantPhone: '', merchantAddress: '',
    recipientName: '', recipientPhone: '', recipientAddress: '',
    originNode: 'Yangon (HQ)', destinationNode: 'Mandalay',
    cbm: '1', weight: '1', deliveryType: 'Normal',
    itemPrice: '', deliveryFees: '3000', prepaidToOs: '', cod: 0,
    paymentMode: 'COLLECT_DELIVERY' as PaymentMode,
    remarks: ''
  });

  // 🧠 Smart COD Calculator Engine
  useEffect(() => {
    const itemValue = parseInt(formData.itemPrice) || 0;
    const advancePaid = parseInt(formData.prepaidToOs) || 0;
    const delivery = parseInt(formData.deliveryFees) || 0;
    
    // Remaining Item Balance
    const remainingItemBalance = Math.max(0, itemValue - advancePaid);
    
    // Total COD = Remaining Item Balance + (Delivery if Receiver Pays)
    let calculatedCod = remainingItemBalance;
    if (formData.paymentMode === 'COLLECT_DELIVERY') {
      calculatedCod += delivery;
    }
    
    setFormData(prev => ({ ...prev, cod: calculatedCod }));
  }, [formData.itemPrice, formData.prepaidToOs, formData.deliveryFees, formData.paymentMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAwb = `BE${Math.floor(Math.random() * 100000000)}MM`;
    
    const newWaybill: WaybillData = {
      awb: newAwb,
      merchantName: formData.merchantName || 'Walk-in Customer',
      merchantPhone: formData.merchantPhone,
      merchantAddress: formData.merchantAddress || 'Branch Drop-off',
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      recipientAddress: formData.recipientAddress,
      originNode: formData.originNode,
      destinationNode: formData.destinationNode,
      cbm: formData.cbm,
      weight: formData.weight,
      deliveryType: formData.deliveryType,
      itemPrice: parseInt(formData.itemPrice) || 0,
      deliveryFees: parseInt(formData.deliveryFees) || 0,
      prepaidToOs: parseInt(formData.prepaidToOs) || 0,
      cod: formData.cod,
      remarks: formData.remarks,
      date: new Date().toLocaleString()
    };

    setQueue([newWaybill, ...queue]);
    
    // Reset core recipient fields but keep sender info for faster batch entry
    setFormData(prev => ({
      ...prev, recipientName: '', recipientPhone: '', recipientAddress: '', itemPrice: '', prepaidToOs: '', remarks: ''
    }));
  };

  const mockExtractOCR = () => {
    setLoading(true);
    setTimeout(() => {
      setQueue([{
        awb: `BE${Math.floor(Math.random() * 100000000)}MM`,
        merchantName: 'Fashion Hub MM', merchantPhone: '09796491867', merchantAddress: 'Yangon',
        recipientName: 'U Aung Aung', recipientPhone: '09792970776', recipientAddress: 'Mandalay, Chan Aye Tharzan',
        originNode: 'Yangon (HQ)', destinationNode: 'Mandalay',
        cbm: '1', weight: '2', deliveryType: 'Express', itemPrice: 150000, deliveryFees: 4000, prepaidToOs: 50000, cod: 104000,
        remarks: 'Handle with care (OCR Extracted)', date: new Date().toLocaleString()
      }, ...queue]);
      setLoading(false);
    }, 1500);
  };

  const handleBatchPrint = () => {
    if (queue.length === 0) return alert('Queue is empty');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Batch Print Waybills</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: 4in 6in; margin: 0; }
            body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printAreaRef.current?.innerHTML}
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
            <Navigation className="h-6 w-6 text-blue-500" />
            {t('Logistics & Route Planning', 'လမ်းကြောင်းနှင့် ကုန်စည်စီမံမှု')}
          </h1>
          <p className="text-xs text-blue-500 mt-2 tracking-[0.2em] font-bold uppercase">Advanced Waybill Generator & Routing Engine</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-[#0E1525] border border-white/5 hover:border-blue-500 text-gray-400 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase">
            <Download className="h-4 w-4" /> {t('Way Plan Report', 'လမ်းကြောင်း အစီရင်ခံစာထုတ်ရန်')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        
        {/* LEFT PANE: Data Ingestion Hub */}
        <div className="xl:col-span-7 flex flex-col space-y-6">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col h-full">
            <h2 className="text-sm font-black tracking-widest uppercase text-gray-400 mb-6">{t('Data Ingestion Method', 'ဒေတာသွင်းယူမည့်နည်းလမ်း')}</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
              <button onClick={() => setInputMode('MANUAL')} className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border ${inputMode === 'MANUAL' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#0A0F1C] border-white/5 text-gray-500 hover:text-white'}`}>
                <Keyboard className="h-6 w-6" /><span className="text-[10px] font-bold uppercase">Manual Form</span>
              </button>
              <button onClick={() => setInputMode('OCR')} className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border ${inputMode === 'OCR' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-[#0A0F1C] border-white/5 text-gray-500 hover:text-white'}`}>
                <ImageIcon className="h-6 w-6" /><span className="text-[10px] font-bold uppercase">Image OCR</span>
              </button>
              <button onClick={() => setInputMode('QR')} className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all border ${inputMode === 'QR' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-[#0A0F1C] border-white/5 text-gray-500 hover:text-white'}`}>
                <QrCode className="h-6 w-6" /><span className="text-[10px] font-bold uppercase">Scan QR</span>
              </button>
            </div>

            {/* --- MANUAL FORM --- */}
            {inputMode === 'MANUAL' && (
              <form onSubmit={handleManualSubmit} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                
                {/* Contact Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SENDER */}
                  <div className="space-y-4 bg-[#0A0F1C] p-5 rounded-2xl border border-white/5 focus-within:border-blue-500/50 transition-colors">
                    <div className="flex items-center gap-2 text-blue-500 mb-2"><User className="h-4 w-4"/><h3 className="text-[10px] font-black tracking-widest uppercase">Merchant / Sender</h3></div>
                    <input required name="merchantPhone" value={formData.merchantPhone} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-white focus:border-blue-500 outline-none font-mono placeholder:text-gray-600" placeholder="Phone Number *" />
                    <input required name="merchantName" value={formData.merchantName} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder:text-gray-600" placeholder="Name / Shop Name *" />
                    <textarea name="merchantAddress" value={formData.merchantAddress} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-white focus:border-blue-500 outline-none placeholder:text-gray-600 resize-none h-10" placeholder="Pickup Address" />
                  </div>
                  
                  {/* RECIPIENT */}
                  <div className="space-y-4 bg-[#0A0F1C] p-5 rounded-2xl border border-white/5 focus-within:border-amber-500/50 transition-colors">
                    <div className="flex items-center gap-2 text-amber-500 mb-2"><User className="h-4 w-4"/><h3 className="text-[10px] font-black tracking-widest uppercase">Recipient / Customer</h3></div>
                    <input required name="recipientPhone" value={formData.recipientPhone} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-white focus:border-amber-500 outline-none font-mono placeholder:text-gray-600" placeholder="Phone Number *" />
                    <input required name="recipientName" value={formData.recipientName} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-white focus:border-amber-500 outline-none placeholder:text-gray-600" placeholder="Full Name *" />
                    <textarea required name="recipientAddress" value={formData.recipientAddress} onChange={handleInputChange} className="w-full bg-transparent border-b border-white/10 px-2 py-2 text-sm text-white focus:border-amber-500 outline-none placeholder:text-gray-600 resize-none h-10" placeholder="Delivery Address *" />
                  </div>
                </div>

                {/* Routing & Logistics */}
                <div className="bg-[#0A0F1C] p-5 rounded-2xl border border-white/5 focus-within:border-emerald-500/50 transition-colors space-y-4">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2"><MapPin className="h-4 w-4"/><h3 className="text-[10px] font-black tracking-widest uppercase">Routing & Parcel Data</h3></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Origin</label><input required name="originNode" value={formData.originNode} onChange={handleInputChange} className="w-full bg-[#0E1525] border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Destination</label><input required name="destinationNode" value={formData.destinationNode} onChange={handleInputChange} className="w-full bg-[#0E1525] border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Weight (kg)</label><input required name="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} className="w-full bg-[#0E1525] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none" /></div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Type</label>
                      <select name="deliveryType" value={formData.deliveryType} onChange={handleInputChange} className="w-full bg-[#0E1525] border border-white/5 rounded-lg px-3 py-2 text-sm text-white outline-none appearance-none">
                        <option>Normal</option><option>Express</option><option>Same Day</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financials & Smart COD */}
                <div className="bg-gradient-to-br from-[#0E1525] to-[#0A0F1C] p-6 rounded-2xl border border-blue-500/20 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400"><Wallet className="h-5 w-5"/><h3 className="text-xs font-black tracking-widest uppercase">Financial Transactions</h3></div>
                    <div className="flex items-center gap-2 bg-[#0A0F1C] p-1 rounded-xl border border-white/5">
                      <button type="button" onClick={() => setFormData({...formData, paymentMode: 'PREPAID_DELIVERY'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${formData.paymentMode === 'PREPAID_DELIVERY' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'}`}>Sender Pays Delivery</button>
                      <button type="button" onClick={() => setFormData({...formData, paymentMode: 'COLLECT_DELIVERY'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${formData.paymentMode === 'COLLECT_DELIVERY' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-white'}`}>Receiver Pays Delivery</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Item Price (MMK)</label><input type="number" name="itemPrice" value={formData.itemPrice} onChange={handleInputChange} className="w-full bg-[#0A0F1C] border border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-white focus:border-blue-500 outline-none" placeholder="0" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Prepaid to Shop (MMK)</label><input type="number" name="prepaidToOs" value={formData.prepaidToOs} onChange={handleInputChange} className="w-full bg-[#0A0F1C] border border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-white focus:border-blue-500 outline-none" placeholder="0" /></div>
                    <div className="space-y-1"><label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Delivery Fee (MMK)</label><input type="number" name="deliveryFees" value={formData.deliveryFees} onChange={handleInputChange} className="w-full bg-[#0A0F1C] border border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-white focus:border-blue-500 outline-none" placeholder="0" /></div>
                  </div>

                  {/* Calculated COD Display */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase text-emerald-500">Auto-Calculated Cash On Delivery (COD)</p>
                      <p className="text-xs text-emerald-400/70 mt-1">Item Balance + {formData.paymentMode === 'COLLECT_DELIVERY' ? 'Delivery Fee' : '0 (Delivery Prepaid)'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black font-mono text-emerald-400">{formData.cod.toLocaleString()}</span>
                      <span className="text-sm font-bold text-emerald-500 ml-2">MMK</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1"><label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Remarks</label><input name="remarks" value={formData.remarks} onChange={handleInputChange} className="w-full bg-[#0E1525] border border-white/5 rounded-lg px-4 py-3 text-sm text-white outline-none" placeholder="Fragile, call before delivery..." /></div>

                <button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] shrink-0">
                  <CheckCircle2 className="h-5 w-5" /> Generate Waybill
                </button>
              </form>
            )}

            {/* --- OCR MODE --- */}
            {inputMode === 'OCR' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors group" onClick={mockExtractOCR}>
                  <UploadCloud className="h-10 w-10 text-emerald-500/50 group-hover:text-emerald-500 mb-3 transition-colors" />
                  <p className="text-xs font-bold uppercase text-emerald-400 tracking-widest">{t('Upload Waybill Image', 'ဓာတ်ပုံတင်ရန်')}</p>
                  <p className="text-[10px] text-gray-500 mt-2">AI will extract Merchant, Routing, and Financials</p>
                </div>
                {loading && (
                  <div className="bg-[#0A0F1C] p-4 rounded-xl border border-white/5 flex items-center justify-center gap-3 text-emerald-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Running OCR Extraction...</span>
                  </div>
                )}
              </div>
            )}

            {/* --- QR SCAN MODE --- */}
            {inputMode === 'QR' && (
              <div className="bg-[#0A0F1C] border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 h-64">
                <QrCode className="h-16 w-16 text-indigo-500/30 mb-4" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Awaiting Scanner Input...</p>
                <input autoFocus className="opacity-0 absolute w-0 h-0" onChange={(e) => {
                  if(e.target.value.length > 5) { mockExtractOCR(); e.target.value=''; }
                }} />
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANE: Printing Queue & Routing Control */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-[#0E1525] border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                <Printer className="h-4 w-4 text-emerald-500" /> Print Spool
              </h2>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">{queue.length} Ready</span>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-[#0A0F1C] custom-scrollbar">
              {queue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <Printer className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Queue is empty</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {queue.map((wb, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white uppercase font-mono">{wb.awb}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{wb.recipientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400">{wb.cod.toLocaleString()} MMK</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded mt-1 inline-block ${wb.deliveryFees > 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-400'}`}>
                           {wb.deliveryFees > 0 ? 'RCV Pays Del' : 'Prepaid Del'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={handleBatchPrint} disabled={queue.length === 0} className="w-full mt-6 h-16 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(5,150,105,0.4)] shrink-0">
              <Printer className="h-5 w-5" /> {t('Batch Print 4x6 Labels', 'စုပေါင်းပရင့်ထုတ်မည်')}
            </button>
          </div>
        </div>

      </div>

      {/* HIDDEN BATCH PRINT AREA */}
      <div className="hidden">
        <div ref={printAreaRef}>
          {queue.map((data, idx) => (
            <div key={idx} className="page-break w-[4in] h-[6in] overflow-hidden">
               <WaybillThermalTemplate data={data} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
