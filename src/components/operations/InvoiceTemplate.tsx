import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceProps {
  id: string;
  sender: string;
  recipient: string;
  route: string;
  weight: number;
  total: number;
  date: string;
  branchCode: string;
  paperSize: '4x6' | 'A4';
}

export default function InvoiceTemplate({ data }: { data: InvoiceProps }) {
  // Dynamic scaling based on paper size
  const isA4 = data.paperSize === 'A4';
  const containerClass = isA4 
    ? "w-[210mm] min-h-[297mm] p-[20mm]" 
    : "w-[4in] min-h-[6in] p-4";
  
  const titleSize = isA4 ? "text-4xl" : "text-xl";
  const textSize = isA4 ? "text-sm" : "text-[10px]";

  return (
    <div id="invoice-render-area" className={`${containerClass} bg-white text-black border border-gray-100 font-sans mx-auto`}>
      <div className={`flex justify-between items-start border-b-4 border-black pb-6 mb-8`}>
        <div>
          <h1 className={`${titleSize} font-black uppercase tracking-tighter`}>BRITIUM EXPRESS</h1>
          <p className={`${textSize} font-bold text-gray-500 uppercase tracking-widest`}>Branch: {data.branchCode}</p>
        </div>
        <QRCodeSVG value={data.id} size={isA4 ? 100 : 50} />
      </div>

      <div className={`space-y-6 ${isA4 ? 'text-lg' : 'text-[11px]'}`}>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="font-bold uppercase text-gray-400">Shipment ID</span>
          <span className="font-mono font-bold">{data.id}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-10 py-4">
          <div className="border-l-4 border-black pl-4">
            <p className="uppercase font-black text-gray-400 text-[10px]">From (Sender)</p>
            <p className="font-bold">{data.sender}</p>
            <p className="text-gray-500 italic mt-2">{data.route.split(' to ')[0]}</p>
          </div>
          <div className="border-l-4 border-black pl-4">
            <p className="uppercase font-black text-gray-400 text-[10px]">To (Recipient)</p>
            <p className="font-bold">{data.recipient}</p>
            <p className="text-gray-500 italic mt-2">{data.route.split(' to ')[1]}</p>
          </div>
        </div>

        <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between">
            <span>Charged Weight:</span>
            <span className="font-bold">{data.weight} KG</span>
          </div>
          <div className="flex justify-between text-2xl font-black border-t border-gray-300 pt-4">
            <span>TOTAL:</span>
            <span>{data.total.toLocaleString()} MMK</span>
          </div>
        </div>
      </div>

      {/* Acknowledgment Section */}
      <div className={`${isA4 ? 'mt-32' : 'mt-12'} pt-8 border-t-2 border-dashed border-gray-400`}>
        <p className="text-center font-black uppercase tracking-[0.3em] text-gray-400 mb-10">Receiver Acknowledgement</p>
        <div className="grid grid-cols-2 gap-12">
          <div className="h-32 border-2 border-gray-200 rounded-3xl flex items-end justify-center pb-4 text-gray-300 uppercase font-bold text-[10px]">Courier Signature</div>
          <div className="h-32 border-2 border-gray-200 rounded-3xl flex items-end justify-center pb-4 text-gray-300 uppercase font-bold text-[10px]">Customer Signature</div>
        </div>
      </div>
    </div>
  );
}
