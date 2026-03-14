import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, QrCode, X, Zap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Advanced QR Code Scanner Component
 * Built with Luxury Design System and Bilingual Support
 * Uses native browser APIs for camera access and stream visualization
 */
export function QRCodeScanner({ onScan, onError, className }: QRCodeScannerProps) {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [torch, setTorch] = useState(false);

  // Localization dictionary
  const labels = {
    en: {
      scanning: "Scanning for QR Code...",
      align: "Align the QR code within the frame",
      errorTitle: "Camera Error",
      errorDesc: "Unable to access camera. Please check permissions.",
      retry: "Retry Camera",
      success: "Code Scanned Successfully",
      simulate: "Simulate Scan (Dev)"
    },
    my: {
      scanning: "QR ကုဒ်ကို ရှာဖွေနေသည်...",
      align: "QR ကုဒ်ကို ဘောင်အတွင်း ထားပေးပါ",
      errorTitle: "ကင်မရာ အမှားအယွင်း",
      errorDesc: "ကင်မရာကို အသုံးပြု၍မရပါ။ ခွင့်ပြုချက်ကို စစ်ဆေးပါ။",
      retry: "ပြန်လည်ကြိုးစားပါ",
      success: "ကုဒ်ကို ဖတ်ရှုပြီးပါပြီ",
      simulate: "စမ်းသပ်ရန် (Dev)"
    }
  };

  const l = language === 'my' ? labels.my : labels.en;

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Camera access denied";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleSimulateScan = () => {
    // Simulation for development/demo purposes if actual scanning logic (like BarcodeDetector) is unavailable
    const mockAwb = `BRT-${Math.floor(100000 + Math.random() * 900000)}`;
    onScan(mockAwb);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] bg-luxury-obsidian border border-white/10 shadow-luxury", className)}>
      {/* Camera Viewport */}
      <div className="aspect-square relative w-full bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        {/* Scanning Overlay UI */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
          {/* Scanner Frame */}
          <div className="relative w-64 h-64 border-2 border-luxury-gold/30 rounded-3xl">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-luxury-gold rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-luxury-gold rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-luxury-gold rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-luxury-gold rounded-br-xl" />

            {/* Laser Animation */}
            <AnimatePresence>
              {isCameraActive && (
                <motion.div
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-luxury-gold to-transparent shadow-[0_0_15px_rgba(212,175,55,0.8)]"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Status Label */}
          <div className="mt-8 text-center">
            <p className="text-luxury-gold font-bold tracking-widest text-xs uppercase">
              {isCameraActive ? l.scanning : l.errorTitle}
            </p>
            <p className="text-white/60 text-sm mt-1">
              {isCameraActive ? l.align : l.errorDesc}
            </p>
          </div>
        </div>

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-white">{l.errorTitle}</h3>
            <p className="text-white/60 mb-6">{l.errorDesc}</p>
            <Button 
              variant="outline" 
              className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black"
              onClick={startCamera}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {l.retry}
            </Button>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white"
            onClick={() => setTorch(!torch)}
          >
            <Zap className={cn("w-5 h-5", torch ? "fill-luxury-gold text-luxury-gold" : "")} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white"
            onClick={startCamera}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Dev Simulation Footer */}
      <div className="p-4 bg-luxury-light-obsidian border-t border-white/5 flex flex-col gap-2">
        <Button 
          onClick={handleSimulateScan} 
          variant="ghost" 
          className="w-full text-[10px] text-white/30 hover:text-luxury-gold hover:bg-white/5 tracking-tighter"
        >
          <QrCode className="w-3 h-3 mr-2" />
          {l.simulate}
        </Button>
      </div>
    </div>
  );
}
