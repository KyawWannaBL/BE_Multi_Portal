import React, { useState } from 'react';
import { Camera, UploadCloud } from 'lucide-react';
import { useBilingual } from '../shared';

export type PhotoAssessment = {
  width: number;
  height: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  score: number;
  issues: string[];
  guidance: string[];
  canUseForOcr: boolean;
};

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function imageAssessment(file: File): Promise<{ dataUrl: string; assessment: PhotoAssessment }> {
  const dataUrl = await fileToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx?.drawImage(img, 0, 0);
  const data = ctx?.getImageData(0, 0, img.width, img.height).data || new Uint8ClampedArray();
  let brightness = 0;
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray.push(g);
    brightness += g;
  }
  brightness = brightness / Math.max(1, gray.length);
  let contrast = 0;
  gray.forEach((g) => (contrast += Math.abs(g - brightness)));
  contrast = contrast / Math.max(1, gray.length);
  let sharpness = 0;
  for (let y = 1; y < img.height - 1; y += 1) {
    for (let x = 1; x < img.width - 1; x += 1) {
      const idx = y * img.width + x;
      const lap = 4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - img.width] - gray[idx + img.width];
      sharpness += Math.abs(lap);
    }
  }
  sharpness = sharpness / Math.max(1, (img.width - 2) * (img.height - 2));
  const issues: string[] = [];
  const guidance: string[] = [];
  if (img.width < 1000 || img.height < 1000) { issues.push('Low resolution'); guidance.push('Move closer and fill more of the frame.'); }
  if (brightness < 75) { issues.push('Underexposed'); guidance.push('Increase lighting or use flash carefully.'); }
  if (brightness > 220) { issues.push('Overexposed'); guidance.push('Reduce glare and avoid direct reflections.'); }
  if (sharpness < 18) { issues.push('Blur detected'); guidance.push('Hold the device still and focus before capture.'); }
  if (contrast < 22) { issues.push('Low contrast'); guidance.push('Use a darker background and better label alignment.'); }
  const score = Math.max(20, Math.min(100, 100 - (img.width < 1000 || img.height < 1000 ? 18 : 0) - (brightness < 75 ? 16 : 0) - (brightness > 220 ? 14 : 0) - (sharpness < 18 ? 24 : 0) - (contrast < 22 ? 12 : 0)));
  if (!issues.length) guidance.push('Photo quality is acceptable for OCR and proof-of-condition review.');
  return {
    dataUrl,
    assessment: {
      width: img.width,
      height: img.height,
      brightness: Number(brightness.toFixed(1)),
      contrast: Number(contrast.toFixed(1)),
      sharpness: Number(sharpness.toFixed(1)),
      score,
      issues,
      guidance,
      canUseForOcr: score >= 65,
    },
  };
}

export function PhotoGuidance({ assessment }: { assessment?: PhotoAssessment | null }) {
  const { t } = useBilingual();
  if (!assessment) {
    return <div className="rounded-3xl border border-white/10 bg-[#0D1626] p-5 text-sm text-white/60">{t('Capture or upload a photo to see quality guidance.', 'ပုံရိုက် သို့မဟုတ် upload လုပ်ပြီး quality guidance ကိုကြည့်ပါ။')}</div>;
  }
  const tone = assessment.score >= 80 ? 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10' : assessment.score >= 60 ? 'text-amber-300 border-amber-500/20 bg-amber-500/10' : 'text-rose-300 border-rose-500/20 bg-rose-500/10';
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1626] p-5 shadow-xl">
      <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('Photo quality guidance', 'ဓာတ်ပုံ quality guidance')}</div>
      <div className={`mb-4 rounded-2xl border px-4 py-3 ${tone}`}>{t('Score', 'အမှတ်')} {assessment.score} / 100</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="Width" value={assessment.width} />
        <Metric label="Height" value={assessment.height} />
        <Metric label={t('Brightness','အလင်း')} value={assessment.brightness} />
        <Metric label={t('Sharpness','ကြည်လင်မှု')} value={assessment.sharpness} />
      </div>
      {assessment.issues.length ? (
        <div className="mt-4">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-rose-300">{t('Issues', 'ပြဿနာများ')}</div>
          <div className="flex flex-wrap gap-2">{assessment.issues.map((issue) => <span key={issue} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-300">{issue}</span>)}</div>
        </div>
      ) : null}
      <div className="mt-4">
        <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">{t('Guidance', 'ညွှန်ကြားချက်များ')}</div>
        <ul className="space-y-2 text-sm text-white/75">{assessment.guidance.map((item, index) => <li key={`${item}-${index}`} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">{item}</li>)}</ul>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/5 bg-black/20 p-3"><div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</div><div className="mt-1 text-sm font-semibold text-white">{value}</div></div>;
}

export default function PhotoEvidenceField({ title, helperText, onReady }: { title?: string; helperText?: string; onReady: (payload: { file: File; dataUrl: string; assessment: PhotoAssessment }) => void; }) {
  const { t } = useBilingual();
  const [preview, setPreview] = useState<string>('');
  const [assessment, setAssessment] = useState<PhotoAssessment | null>(null);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    const result = await imageAssessment(file);
    setPreview(result.dataUrl);
    setAssessment(result.assessment);
    onReady({ file, dataUrl: result.dataUrl, assessment: result.assessment });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{title || t('Parcel photo evidence', 'ပါဆယ်ဓာတ်ပုံ')}</div>
        <div className="mt-1 text-xs text-white/55">{helperText || t('Capture with camera or upload from device gallery.', 'ကင်မရာဖြင့်ရိုက်ပါ သို့မဟုတ် gallery မှ upload လုပ်ပါ။')}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white">
          <Camera size={14} /> {t('Camera', 'ကင်မရာ')}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0])} />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white">
          <UploadCloud size={14} /> {t('Upload', 'တင်မည်')}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleFile(e.target.files?.[0])} />
        </label>
      </div>
      {preview ? <div className="mt-4 overflow-hidden rounded-2xl border border-white/10"><img src={preview} alt="evidence" className="max-h-[360px] w-full object-cover bg-black" /></div> : null}
      {assessment ? <div className="mt-3 text-xs text-white/60">{t('Latest score', 'နောက်ဆုံးအမှတ်')}: {assessment.score} / 100</div> : null}
    </div>
  );
}
