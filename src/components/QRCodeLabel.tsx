import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { IMAGES } from '@/assets/images';

interface QRCodeLabelProps {
  shipmentData: {
    awb_number: string;
    sender_name: string;
    sender_phone: string;
    sender_address: string;
    receiver_name: string;
    receiver_phone: string;
    receiver_address: string;
    service_type: string;
    weight: number;
    cod_amount?: number;
    created_at: string;
  };
  onPrint?: () => void;
  className?: string;
}

export function QRCodeLabel({ shipmentData, onPrint, className }: QRCodeLabelProps) {
  const { t, language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [shipmentData]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    const qrData = {
      awb: shipmentData.awb_number,
      type: 'SHIPMENT',
      sender: shipmentData.sender_name,
      receiver: shipmentData.receiver_name,
      service: shipmentData.service_type,
      weight: shipmentData.weight,
      cod: shipmentData.cod_amount || 0,
      date: shipmentData.created_at
    };

    try {
      // Simple QR code placeholder - in production, use a QR library
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.fillText('QR Code', 40, 60);
        ctx.fillText(shipmentData.awb_number, 20, 75);
      }
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  };

  const handlePrint = () => {
    if (labelRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Waybill - ${shipmentData.awb_number}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px;
                  background: white;
                }
                .label { 
                  width: 4in; 
                  height: 6in; 
                  border: 2px solid #000; 
                  padding: 10px;
                  box-sizing: border-box;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #000; 
                  padding-bottom: 10px; 
                  margin-bottom: 10px;
                }
                .logo { 
                  width: 80px; 
                  height: auto;
                }
                .company-name { 
                  font-size: 18px; 
                  font-weight: bold; 
                  color: #D4AF37;
                  margin: 5px 0;
                }
                .awb-number { 
                  font-size: 16px; 
                  font-weight: bold; 
                  margin: 5px 0;
                }
                .section { 
                  margin: 8px 0; 
                  font-size: 11px;
                }
                .section-title { 
                  font-weight: bold; 
                  background: #f0f0f0; 
                  padding: 2px 4px;
                  margin-bottom: 3px;
                }
                .qr-section { 
                  text-align: center; 
                  margin: 10px 0;
                }
                .footer { 
                  border-top: 1px solid #000; 
                  padding-top: 5px; 
                  margin-top: 10px; 
                  font-size: 10px; 
                  text-align: center;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${labelRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
    onPrint?.();
  };

  const handleDownload = async () => {
    if (labelRef.current) {
      try {
        const html2canvas = await import('html2canvas');
        const canvas = await html2canvas.default(labelRef.current, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = `waybill-${shipmentData.awb_number}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Print Controls */}
      <div className="flex gap-2 no-print">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          {language === 'my' ? 'ပုံနှိပ်မည်' : 'Print Label'}
        </Button>
        <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          {language === 'my' ? 'ဒေါင်းလုဒ်လုပ်မည်' : 'Download'}
        </Button>
      </div>

      {/* Waybill Label */}
      <Card ref={labelRef} className="label w-[4in] h-[6in] p-4 bg-white border-2 border-black">
        {/* Header */}
        <div className="header text-center border-b-2 border-black pb-3 mb-3">
          <img 
            src={IMAGES.BRITIUM_LOGO_65} 
            alt="Britium Express" 
            className="logo w-20 h-auto mx-auto mb-2"
          />
          <div className="company-name text-lg font-bold text-[#D4AF37]">
            BRITIUM EXPRESS
          </div>
          <div className="text-sm text-gray-600">
            {language === 'my' ? 'လျင်မြန်သော ပို့ဆောင်ရေး ဝန်ဆောင်မှု' : 'Premium Logistics Service'}
          </div>
          <div className="awb-number text-base font-bold mt-2">
            AWB: {shipmentData.awb_number}
          </div>
        </div>

        {/* Sender Information */}
        <div className="section">
          <div className="section-title">
            {language === 'my' ? 'ပို့သူအချက်အလက်' : 'SENDER INFORMATION'}
          </div>
          <div><strong>{language === 'my' ? 'အမည်:' : 'Name:'}</strong> {shipmentData.sender_name}</div>
          <div><strong>{language === 'my' ? 'ဖုန်း:' : 'Phone:'}</strong> {shipmentData.sender_phone}</div>
          <div><strong>{language === 'my' ? 'လိပ်စာ:' : 'Address:'}</strong> {shipmentData.sender_address}</div>
        </div>

        {/* Receiver Information */}
        <div className="section">
          <div className="section-title">
            {language === 'my' ? 'လက်ခံသူအချက်အလက်' : 'RECEIVER INFORMATION'}
          </div>
          <div><strong>{language === 'my' ? 'အမည်:' : 'Name:'}</strong> {shipmentData.receiver_name}</div>
          <div><strong>{language === 'my' ? 'ဖုန်း:' : 'Phone:'}</strong> {shipmentData.receiver_phone}</div>
          <div><strong>{language === 'my' ? 'လိပ်စာ:' : 'Address:'}</strong> {shipmentData.receiver_address}</div>
        </div>

        {/* Service Details */}
        <div className="section">
          <div className="section-title">
            {language === 'my' ? 'ဝန်ဆောင်မှုအချက်အလက်' : 'SERVICE DETAILS'}
          </div>
          <div className="flex justify-between">
            <span><strong>{language === 'my' ? 'ဝန်ဆောင်မှု:' : 'Service:'}</strong> {shipmentData.service_type}</span>
            <span><strong>{language === 'my' ? 'အလေးချိန်:' : 'Weight:'}</strong> {shipmentData.weight}kg</span>
          </div>
          {shipmentData.cod_amount && shipmentData.cod_amount > 0 && (
            <div><strong>COD:</strong> {shipmentData.cod_amount.toLocaleString()} MMK</div>
          )}
          <div><strong>{language === 'my' ? 'ရက်စွဲ:' : 'Date:'}</strong> {new Date(shipmentData.created_at).toLocaleDateString()}</div>
        </div>

        {/* QR Code */}
        <div className="qr-section text-center my-3">
          <canvas ref={canvasRef} className="mx-auto" />
          <div className="text-xs mt-1">
            {language === 'my' ? 'QR ကုဒ်ဖြင့် ခြေရာခံပါ' : 'Scan QR Code to Track'}
          </div>
        </div>

        {/* Footer */}
        <div className="footer border-t border-black pt-2 mt-3 text-xs text-center">
          <div className="flex justify-between">
            <span>{language === 'my' ? 'ဖုန်း: +95-9-123-456-789' : 'Phone: +95-9-123-456-789'}</span>
            <span>www.britiumexpress.com</span>
          </div>
          <div className="mt-1 text-[10px] text-gray-500">
            {language === 'my' 
              ? 'ဤလက်မှတ်သည် ပို့ဆောင်မှုအတွက် အရေးကြီးသော စာရွက်စာတမ်းဖြစ်သည်'
              : 'This waybill is an important document for shipment tracking'
            }
          </div>
        </div>
      </Card>
    </div>
  );
}

export default QRCodeLabel;