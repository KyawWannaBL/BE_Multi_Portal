import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface WaybillData {
  awb: string;
  merchantName: string;
  merchantPhone: string;
  merchantAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  originNode: string;
  destinationNode: string;
  cbm: string;
  weight: string;
  deliveryType: string;
  itemPrice: number;
  deliveryFees: number;
  prepaidToOs: number;
  cod: number;
  remarks: string;
  date: string;
}

interface Props {
  data: WaybillData;
}

export default function WaybillThermalTemplate({ data }: Props) {
  return (
    <div className="w-[4in] h-[6in] bg-white text-black p-2 font-sans flex flex-col border border-black box-border overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-start border-b border-black pb-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Mock Logo */}
          <div className="w-12 h-12 rounded-full border-2 border-blue-900 flex items-center justify-center bg-blue-50">
            <span className="font-black text-blue-900 text-xl tracking-tighter">BE</span>
          </div>
          <div>
            <h1 className="font-black text-sm leading-tight tracking-tight uppercase">BRITIUM EXPRESS</h1>
            <h2 className="text-[10px] font-bold tracking-widest text-gray-700 uppercase">Delivery Service</h2>
            <p className="text-[10px] font-bold mt-0.5">HotLine: 09 - 897 44 77 44</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-bold mb-1">{data.date}</p>
          <QRCodeSVG value={data.awb} size={60} level="H" />
          <p className="text-[8px] font-bold mt-1 uppercase tracking-widest">{data.awb}</p>
        </div>
      </div>

      {/* 2. SENDER DETAILS */}
      <div className="border-b border-black pb-2 mb-2 text-xs leading-snug flex">
        <div className="w-16 font-bold">Merchant:</div>
        <div className="flex-1 space-y-1">
          <p className="font-bold">{data.merchantName}</p>
          <p>{data.merchantPhone}</p>
          <p className="line-clamp-2">{data.merchantAddress}</p>
        </div>
      </div>

      {/* 3. RECIPIENT DETAILS */}
      <div className="border-b border-black pb-2 mb-2 text-xs leading-snug flex min-h-[60px]">
        <div className="w-16 font-bold">Recipient:</div>
        <div className="flex-1 space-y-1">
          <p className="font-bold text-sm">{data.recipientName}</p>
          <p className="font-bold text-sm">{data.recipientPhone}</p>
          <p className="line-clamp-2">{data.recipientAddress}</p>
        </div>
      </div>

      {/* 4. ROUTING NODES */}
      <div className="flex justify-between items-center border-b border-black pb-2 mb-2 px-2">
        <p className="font-black text-sm">** {data.originNode} **</p>
        <p className="font-black text-sm">** {data.destinationNode} **</p>
      </div>

      {/* 5. FINANCIALS & METRICS */}
      <div className="flex border-b border-black pb-2 mb-2 text-[10px]">
        <div className="flex-1 grid grid-cols-2 gap-1 pr-2">
          <div className="font-bold">CBM:</div><div>{data.cbm}</div>
          <div className="font-bold">Weight (kg):</div><div>≤{data.weight}</div>
          <div className="font-bold">Delivery:</div><div className="font-bold">{data.deliveryType}</div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-1 px-2 border-l border-black">
          <div className="font-bold">Item Price:</div><div className="text-right">{data.itemPrice.toLocaleString()}</div>
          <div className="font-bold">Delivery Fees:</div><div className="text-right">{data.deliveryFees.toLocaleString()}</div>
          <div className="font-bold">Prepaid to OS:</div><div className="text-right">{data.prepaidToOs.toLocaleString()}</div>
        </div>
        
        {/* The prominent COD Box */}
        <div className="w-[120px] bg-gray-200 border border-black rounded-lg p-2 flex flex-col justify-between ml-2">
          <p className="text-right font-bold text-[8px]">COD</p>
          <p className="text-center font-black text-xl">{data.cod.toLocaleString()}</p>
          <p className="text-right font-bold text-[8px]">MMK</p>
        </div>
      </div>

      {/* 6. REMARKS & FOOTER */}
      <div className="flex border-b border-black pb-2 mb-2 text-[10px]">
        <span className="font-bold w-16">Remarks:</span>
        <span className="font-bold flex-1 break-words">{data.remarks}</span>
      </div>

      <div className="mt-auto text-[8px] font-bold text-center leading-tight">
        အောက်ပါ ဖုန်းနံပါတ်များသို့ ဆက်သွယ်စုံစမ်းနိုင်ပါသည်။<br/>
        <span className="text-[10px]">Hotline သို့ဆက်သွယ် တိုင်ကြားနိုင်ပါသည်။</span>
      </div>

    </div>
  );
}
