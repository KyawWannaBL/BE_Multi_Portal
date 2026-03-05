import React, { useRef } from 'react';
import { Printer, Download, Package, User, MapPin, Phone, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IMAGES } from '@/assets/images';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { cn } from '@/lib/utils';

interface ParcelQRLabelProps {
  parcel: any;
  onPrint?: () => void;
  onDownload?: () => void;
}

/**
 * Parcel QR Label Component
 * Generates a high-fidelity printable delivery label matching the Britium Express format.
 * Designed for production logistics use with a luxury aesthetic for the digital interface.
 */
export function ParcelQRLabel({ parcel, onPrint, onDownload }: ParcelQRLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    const printContent = labelRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${parcel.awb_number || 'Parcel'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: 100mm 150mm; margin: 0; }
              body { margin: 0; padding: 10mm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const sender = parcel.pickup_address || {};
  const receiver = parcel.delivery_address || {};
  const details = parcel.package_details || {};
  const awb = parcel.awb_number || parcel.trackingNumber || 'PENDING';
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <Card className="luxury-card p-0 overflow-hidden bg-white text-black w-full max-w-[400px] shadow-2xl border-luxury-gold/20">
        {/* Digital Preview Header */}
        <div className="bg-luxury-obsidian p-3 flex justify-between items-center border-b border-luxury-gold/30">
          <span className="text-[10px] font-mono text-luxury-gold tracking-widest uppercase">Label Preview</span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrint}
              className="h-8 w-8 text-luxury-gold hover:bg-luxury-gold/10 hover:text-luxury-gold"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDownload}
              className="h-8 w-8 text-luxury-gold hover:bg-luxury-gold/10 hover:text-luxury-gold"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div 
          ref={labelRef} 
          className="p-6 bg-white flex flex-col gap-4 font-sans print:p-4"
          style={{ minHeight: '550px' }}
        >
          {/* Top Section: Logo & AWB */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div className="flex flex-col gap-1">
              <img 
                src={IMAGES.BRITIUM_LOGO_65} 
                alt="Britium Express" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-[10px] font-bold tracking-tighter uppercase">Express Logistics Network</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-500 uppercase">AWB Number</div>
              <div className="text-xl font-mono font-black">{awb}</div>
              <div className="text-[8px] mt-1 bg-black text-white px-2 py-0.5 rounded-full inline-block">
                PRIORITY SERVICE
              </div>
            </div>
          </div>

          {/* Middle Section: QR Code & Zone */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex justify-center items-center border-r border-dashed border-gray-300">
              <QRCodeGenerator 
                data={awb} 
                size={140} 
                label={awb} 
              />
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-[10px] font-bold text-gray-500 uppercase">Destination Zone</div>
              <div className="text-5xl font-black text-black tracking-tighter">
                {receiver.city?.substring(0, 3).toUpperCase() || 'DXB'}
              </div>
              <div className="mt-2 text-[12px] font-bold border-2 border-black px-3 py-1">
                ROUTE: {parcel.metadata?.route_id || 'A-102'}
              </div>
            </div>
          </div>

          {/* Address Sections */}
          <div className="grid grid-cols-1 gap-4 border-t-2 border-black pt-4">
            {/* Sender */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                <Package className="h-3 w-3" /> From (Sender)
              </div>
              <div className="text-[14px] font-bold">{sender.name || 'Merchant Name'}</div>
              <div className="text-[12px] leading-tight text-gray-700">
                {sender.address || 'Loading sender address...'}<br />
                {sender.city || ''}, {sender.phone || ''}
              </div>
            </div>

            {/* Receiver */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                <Truck className="h-3 w-3" /> To (Recipient)
              </div>
              <div className="text-[16px] font-black">{receiver.name || 'Customer Name'}</div>
              <div className="text-[13px] leading-tight font-medium">
                {receiver.address || 'Loading delivery address...'}<br />
                <span className="font-bold">{receiver.city || ''}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 font-mono text-[13px] font-bold">
                <Phone className="h-3 w-3" /> {receiver.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-auto border-t border-black pt-3 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase">
            <div className="flex flex-col">
              <span className="text-gray-500">Weight</span>
              <span>{details.weight || '0.5'} KG</span>
            </div>
            <div className="flex flex-col border-x border-gray-300 px-2">
              <span className="text-gray-500">COD Amount</span>
              <span>{details.cod ? `${details.cod} AED` : 'Prepaid'}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-gray-500">Print Date</span>
              <span>{date}</span>
            </div>
          </div>

          {/* Disclaimer/Terms */}
          <div className="text-[7px] text-gray-400 mt-2 leading-none text-center italic">
            Subject to Britium Express terms and conditions. Track your shipment at britium.com using AWB above.
          </div>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button 
          className="luxury-button"
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" /> Print Label
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full px-8 border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/10"
          onClick={onDownload}
        >
          <Download className="mr-2 h-4 w-4" /> Save PDF
        </Button>
      </div>
    </div>
  );
}
