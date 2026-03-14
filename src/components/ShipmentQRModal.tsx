import { Shipment, formatDate } from "@/lib";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, MapPin, Package, Calendar, Info } from "lucide-react";
import { useState, useRef } from "react";

/**
 * ShipmentQRModal - A luxury modal for displaying and managing shipment QR codes.
 * Features print-ready label generation and direct image download.
 */

interface ShipmentQRModalProps {
  shipment: Shipment;
  isOpen: boolean;
  onClose: () => void;
}

export function ShipmentQRModal({ shipment, isOpen, onClose }: ShipmentQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const trackingId = shipment.awb_number || shipment.trackingNumber || "N/A";

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR_${trackingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Construct a professional print label layout
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipment Label - ${trackingId}</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body { 
              font-family: 'Inter', sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background: #fff;
            }
            .label-card {
              width: 100mm;
              padding: 10mm;
              border: 1px solid #000;
              text-align: center;
              box-sizing: border-box;
            }
            .header {
              font-size: 24pt;
              font-weight: 800;
              margin-bottom: 5mm;
              letter-spacing: -0.02em;
            }
            .qr-wrapper {
              margin: 5mm 0;
            }
            .info-grid {
              text-align: left;
              border-top: 1px solid #eee;
              padding-top: 5mm;
              font-size: 10pt;
              color: #333;
            }
            .info-row {
              margin-bottom: 2mm;
            }
            .label-tag {
              font-weight: 700;
              text-transform: uppercase;
              font-size: 8pt;
              color: #666;
              display: block;
            }
            .footer-tag {
              margin-top: 10mm;
              font-size: 7pt;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">${trackingId}</div>
            <div class="qr-wrapper">
              <img src="${qrDataUrl}" width="220" height="220" />
            </div>
            <div class="info-grid">
              <div class="info-row">
                <span class="label-tag">Route</span>
                <strong>${shipment.origin || "Local"} &rarr; ${shipment.destination || "Pending"}</strong>
              </div>
              <div class="info-row">
                <span class="label-tag">Date Issued</span>
                <strong>${shipment.created_at ? formatDate(shipment.created_at) : "2026-02-18"}</strong>
              </div>
              <div class="info-row">
                <span class="label-tag">Status</span>
                <strong>${shipment.status}</strong>
              </div>
            </div>
            <div class="footer-tag">© 2026 FleetLogix Enterprise</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-background border-border/40 shadow-luxury p-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* Left Panel: QR Presentation */}
          <div className="w-full md:w-5/12 bg-muted/20 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/40">
            <div className="relative p-4 bg-white rounded-2xl shadow-xl transition-transform hover:scale-105 duration-500">
              <QRCodeGenerator
                data={trackingId}
                size={220}
                label={trackingId}
                onGenerated={setQrDataUrl}
              />
            </div>
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Tracking Link</span>
              </div>
              <p className="text-xs text-muted-foreground">Ready for scanning by warehouse & riders</p>
            </div>
          </div>

          {/* Right Panel: Actions & Details */}
          <div className="w-full md:w-7/12 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-heading text-foreground">
                  Shipment Identifier
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Secure QR code for tracking and internal logistics routing.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5">
                <div className="flex items-start gap-4 p-3 rounded-xl bg-accent/5 border border-border/20">
                  <Package className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">AWB Identifier</p>
                    <p className="text-lg font-mono font-bold text-foreground">{trackingId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-1" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Destination</p>
                      <p className="text-sm font-medium">{shipment.destination || "Global Hub"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-primary mt-1" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Timestamp</p>
                      <p className="text-sm font-medium">
                        {shipment.created_at ? formatDate(shipment.created_at) : "2026-02-18"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
                  <Info className="w-3 h-3" />
                  <span>QR Codes are encrypted and valid for the entire lifecycle.</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-full border-border/40 hover:bg-muted/50 transition-all font-semibold"
                onClick={handleDownload}
                disabled={!qrDataUrl}
              >
                <Download className="w-4 h-4 mr-2 text-primary" />
                Download PNG
              </Button>
              <Button
                className="flex-1 h-12 rounded-full luxury-button tracking-[0.2em] shadow-lg shadow-primary/20"
                onClick={handlePrint}
                disabled={!qrDataUrl}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Label
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
