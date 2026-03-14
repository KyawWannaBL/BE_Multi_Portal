import React, { useEffect, useRef, useState } from 'react';
import { Camera, ImageUp, Keyboard, QrCode, ScanLine, StopCircle } from 'lucide-react';
import { useBilingual } from '../shared';

type Props = {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  helperText?: string;
};

async function scanBitmapWithNative(file: File): Promise<string | null> {
  const Detector = (window as any).BarcodeDetector;
  if (!Detector) return null;
  const bitmap = await createImageBitmap(file);
  const detector = new Detector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8'] });
  const results = await detector.detect(bitmap);
  return results?.[0]?.rawValue || null;
}

export default function DeviceQrScanner({ value, onChange, title, helperText }: Props) {
  const { t } = useBilingual();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [supportsNative, setSupportsNative] = useState(false);

  useEffect(() => {
    setSupportsNative(Boolean((window as any).BarcodeDetector));
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopCamera = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setStatus('');
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus(supportsNative ? t('Scanning camera feed…', 'ကင်မရာဖြင့် စကင်လုပ်နေသည်…') : t('Camera opened. Native scanner is not available on this device, so use upload or manual input.', 'ကင်မရာဖွင့်ပြီးပါပြီ။ ဒီဖုန်း/စက်မှာ native scanner မရရှိပါ။ upload သို့မဟုတ် manual input ကိုသုံးပါ။'));

      if (supportsNative) {
        const Detector = (window as any).BarcodeDetector;
        const detector = new Detector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8'] });
        timerRef.current = window.setInterval(async () => {
          try {
            if (!videoRef.current) return;
            const results = await detector.detect(videoRef.current);
            const raw = results?.[0]?.rawValue;
            if (raw) {
              onChange(raw);
              setStatus(t('Code detected from camera.', 'ကင်မရာမှ code ကို ရှာတွေ့ပါသည်။'));
              stopCamera();
            }
          } catch {
            // keep polling silently
          }
        }, 700);
      }
    } catch {
      setStatus(t('Unable to access camera on this device/browser.', 'ဒီစက်/Browser မှာ camera မဖွင့်နိုင်ပါ။'));
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{title || t('QR / barcode intake', 'QR / Barcode စနစ်')}</div>
          <div className="mt-1 text-xs text-white/55">{helperText || t('Camera, image upload, and manual fallback are all available.', 'Camera, image upload, manual fallback တို့အားလုံး ရရှိနိုင်ပါသည်။')}</div>
        </div>
        <QrCode className="h-5 w-5 text-emerald-300" />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('Scan or type code', 'Code ကို စကင်ဖတ် သို့မဟုတ် ရိုက်ထည့်ပါ')}
          className="w-full rounded-2xl border border-white/10 bg-[#08101B] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
        />
        <div className="flex flex-wrap gap-2">
          {!cameraOpen ? (
            <button type="button" onClick={() => void openCamera()} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white">
              <Camera size={14} /> {t('Open camera', 'ကင်မရာဖွင့်')}
            </button>
          ) : (
            <button type="button" onClick={stopCamera} className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-black uppercase text-rose-300">
              <StopCircle size={14} /> {t('Stop', 'ရပ်မည်')}
            </button>
          )}

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white">
            <ImageUp size={14} /> {t('Upload code image', 'Code ပုံတင်')}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const raw = await scanBitmapWithNative(file);
                if (raw) {
                  onChange(raw);
                  setStatus(t('Code detected from uploaded image.', 'တင်ထားသော ပုံမှ code ကို ရှာတွေ့ပါသည်။'));
                } else {
                  setStatus(t('No machine-readable code found in image. Please type it manually.', 'ပုံအတွင်း machine-readable code မတွေ့ပါ။ လက်ဖြင့်ရိုက်ထည့်ပါ။'));
                }
              }}
            />
          </label>

          <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white">
            <Keyboard size={14} /> {t('Clear', 'ရှင်း')}
          </button>
        </div>
      </div>

      {cameraOpen ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} playsInline muted className="max-h-[360px] w-full object-cover" />
          <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-emerald-300">
            <ScanLine size={14} /> {supportsNative ? t('Native scanner is polling the video feed.', 'Native scanner က video feed ကို စစ်ဆေးနေပါသည်။') : t('Native browser scanner not found. Use upload or manual input.', 'Native browser scanner မရှိပါ။ upload သို့မဟုတ် manual input ကိုသုံးပါ။')}
          </div>
        </div>
      ) : null}

      {status ? <div className="mt-3 text-xs text-white/60">{status}</div> : null}
    </div>
  );
}
