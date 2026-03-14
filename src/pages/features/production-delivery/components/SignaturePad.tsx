import React, { useEffect, useRef, useState } from 'react';
import { Eraser, PenLine, Save } from 'lucide-react';
import { useBilingual } from '../shared';

export default function SignaturePad({ onChange }: { onChange?: (payload: { dataUrl: string | null; isSigned: boolean }) => void }) {
  const { t } = useBilingual();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 600;
    const height = 220;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#07111f';
    ctx.fillRect(0, 0, width, height);
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = point(event);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!isSigned) setIsSigned(true);
  };
  const end = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const dataUrl = canvasRef.current?.toDataURL('image/png') || null;
    onChange?.({ dataUrl, isSigned: Boolean(dataUrl && isSigned) });
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#07111f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    onChange?.({ dataUrl: null, isSigned: false });
  };
  const save = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png') || null;
    onChange?.({ dataUrl, isSigned: Boolean(dataUrl) });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1626] p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{t('Electronic signature', 'အီလက်ထရောနစ် လက်မှတ်')}</div>
          <div className="mt-1 text-sm font-semibold text-white">{t('Customer / merchant sign-off', 'ဖောက်သည် / merchant အတည်ပြုချက်')}</div>
        </div>
        <div className="text-xs text-white/50">{isSigned ? t('Signed', 'လက်မှတ်ရှိ') : t('Waiting for signature', 'လက်မှတ်စောင့်နေ')}</div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <canvas ref={canvasRef} className="block w-full touch-none bg-[#07111f]" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase text-white"><Eraser size={14} /> {t('Clear', 'ရှင်းမည်')}</button>
        <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase text-emerald-300"><Save size={14} /> {t('Save signature', 'လက်မှတ်သိမ်း')}</button>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"><PenLine size={14} /> {t('Finger, stylus, mouse, and touchpad supported', 'လက်ချောင်း၊ stylus၊ mouse၊ touchpad အားလုံးရသည်')}</div>
      </div>
    </div>
  );
}
