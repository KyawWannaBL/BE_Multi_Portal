import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Check, Trash2, PenLine } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ElectronicSignatureProps {
  onSignature: (signature: string) => void;
  onClear?: () => void;
  className?: string;
}

export function ElectronicSignature({ onSignature, onClear, className }: ElectronicSignatureProps) {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPointerPos = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // Stop scrolling on mobile while drawing
    if (e.cancelable) e.preventDefault();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#D4AF37'; // Luxury Gold
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setIsEmpty(false);

    if (e.cancelable) e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    if (onClear) onClear();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataURL = canvas.toDataURL('image/png');
    onSignature(dataURL);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        // High DPI Support
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 200 * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `200px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        
        // Reset state after resize as clear happens automatically
        setIsEmpty(true);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const labels = {
    title: language === 'my' ? 'အီလက်ထရွန်နစ် လက်မှတ်' : 'Electronic Signature',
    clear: language === 'my' ? 'ပြန်စရန်' : 'Reset',
    confirm: language === 'my' ? 'လက်မှတ် အတည်ပြုရန်' : 'Confirm Signature',
    placeholder: language === 'my' ? 'ဤနေရာတွင် လက်မှတ်ထိုးပါ' : 'Sign here',
    helper: language === 'my' ? 'ကျေးဇူးပြု၍ လက်မှတ်ထိုးပြီး အတည်ပြုခလုတ်ကို နှိပ်ပါ' : 'Please sign and press confirm button'
  };

  return (
    <div className={cn("luxury-card p-6 flex flex-col gap-5 border-luxury-gold/20", className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-luxury-gold uppercase tracking-[0.2em] flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            {labels.title}
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {labels.helper}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clear}
          className="h-8 px-3 text-[10px] border-luxury-gold/30 text-luxury-gold hover:bg-luxury-gold/10 uppercase tracking-widest"
        >
          <Trash2 className="w-3 h-3 mr-2" />
          {labels.clear}
        </Button>
      </div>

      <div className="relative bg-black/60 border border-luxury-gold/10 rounded-2xl overflow-hidden touch-none h-[200px] shadow-inner">
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <p className="text-sm font-mono uppercase tracking-[0.3em] text-luxury-cream">{labels.placeholder}</p>
            <div className="w-32 h-[1px] bg-luxury-gold mt-4" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button
          onClick={save}
          disabled={isEmpty}
          className="luxury-button w-full flex items-center justify-center gap-3 py-6 text-xs transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
        >
          <Check className="w-4 h-4" />
          {labels.confirm}
        </Button>
        <p className="text-[9px] text-center text-muted-foreground italic">
          © 2026 Britium Express Logistics System
        </p>
      </div>
    </div>
  );
}
