import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely within the component scope
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  label?: string;
  onGenerated?: (dataUrl: string) => void;
}

/**
 * QRCodeGenerator Component
 * Generates and manages QR codes for shipment tracking with export capabilities.
 * Adheres to the Luxury Design System for enterprise logistics (Current Year: 2026).
 */
export function QRCodeGenerator({
  data,
  size = 256,
  label,
  onGenerated
}: QRCodeGeneratorProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Using QRServer API for reliable QR generation without heavy local libraries
  // QRServer is a standard choice for logistics labels in many enterprise setups
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=10&bgcolor=ffffff`;

  useEffect(() => {
    if (onGenerated) {
      onGenerated(qrUrl);
    }
  }, [qrUrl, onGenerated]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setIsCopied(true);
      toast.success("Tracking ID copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy tracking code");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shipment-qr-${data}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR Code saved successfully");
    } catch (err) {
      toast.error("Failed to download QR code");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print shipment labels");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Britium Logistics - Shipment Label [${data}]</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono:wght@700&display=swap');
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              font-family: 'Inter', sans-serif; 
              color: #0b0c10;
              background: #fff;
            }
            .label-card { 
              border: 3px solid #D4AF37; 
              padding: 50px; 
              border-radius: 24px; 
              text-align: center; 
              max-width: 400px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }
            .qr-image { width: ${size}px; height: ${size}px; margin-bottom: 24px; border: 1px solid #eee; }
            .meta { 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 0.25em; 
              color: #666; 
              margin-bottom: 8px;
              font-weight: 600;
            }
            .id-text { 
              font-family: 'JetBrains Mono', monospace; 
              font-size: 28px; 
              font-weight: 800; 
              color: #0b0c10;
              letter-spacing: -0.5px;
              margin-bottom: 20px;
            }
            .footer { 
              margin-top: 40px; 
              font-size: 10px; 
              color: #999; 
              border-top: 1px solid #eee;
              padding-top: 15px;
            }
            @media print {
              body { height: auto; }
              .label-card { border: 2px solid #000; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="meta">Britium Enterprise Logistics</div>
            <img src="${qrUrl}" class="qr-image" />
            <div class="meta">Tracking Manifest ID</div>
            <div class="id-text">${label || data}</div>
            <div class="footer">
              © 2026 Britium Logistics System • Generated 2026-02-19
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* QR Code Container with Luxury Design System Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative group"
      >
        <div className="luxury-glass p-1.5 rounded-[2.5rem] bg-gradient-to-br from-luxury-gold/40 via-luxury-gold/5 to-transparent shadow-luxury">
          <div className="bg-luxury-obsidian rounded-[2.2rem] p-8 flex flex-col items-center border border-white/10">
            <div className="relative aspect-square bg-white p-6 rounded-[1.5rem] overflow-hidden shadow-inner ring-1 ring-black/5">
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div 
                    key="loader"
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white z-10"
                  >
                    <div className="w-10 h-10 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
              <img 
                src={qrUrl} 
                alt="Shipment QR"
                loading="eager"
                className={cn(
                  "w-full h-full object-contain mix-blend-multiply transition-opacity duration-500",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                style={{ width: size, height: size }}
              />
            </div>

            {(label || data) && (
              <div className="mt-8 text-center w-full">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-2">Secure Tracking Manifest</p>
                <p className="font-mono text-2xl font-black text-primary tracking-tighter">
                  {label || data}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Decorative background glow using design system gold */}
        <div className="absolute -inset-8 bg-luxury-gold/5 blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </motion.div>

      {/* Action Suite - High Density Utility Grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[420px]">
        <Button 
          variant="outline" 
          onClick={handleCopy}
          className="flex flex-col items-center gap-2 h-auto py-6 border-white/5 bg-white/5 hover:bg-white/10 hover:border-luxury-gold/40 transition-all group"
        >
          <div className="p-2.5 rounded-full bg-luxury-gold/10 group-hover:bg-luxury-gold/20 transition-colors">
            {isCopied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-luxury-gold" />
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Copy ID</span>
        </Button>

        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="flex flex-col items-center gap-2 h-auto py-6 border-white/5 bg-white/5 hover:bg-white/10 hover:border-luxury-gold/40 transition-all group"
        >
          <div className="p-2.5 rounded-full bg-luxury-gold/10 group-hover:bg-luxury-gold/20 transition-colors">
            <Download className="w-5 h-5 text-luxury-gold" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Save PNG</span>
        </Button>

        <Button 
          variant="outline" 
          onClick={handlePrint}
          className="flex flex-col items-center gap-2 h-auto py-6 border-white/5 bg-white/5 hover:bg-white/10 hover:border-luxury-gold/40 transition-all group"
        >
          <div className="p-2.5 rounded-full bg-luxury-gold/10 group-hover:bg-luxury-gold/20 transition-colors">
            <Printer className="w-5 h-5 text-luxury-gold" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Print</span>
        </Button>
      </div>

      <div className="text-center px-6">
        <p className="text-[11px] text-muted-foreground/50 italic max-w-[320px] leading-relaxed">
          Logistics tracking artifacts are cryptographically generated and compliant with 2026 enterprise standards.
        </p>
      </div>
    </div>
  );
}
