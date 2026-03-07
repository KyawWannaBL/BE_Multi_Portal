import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  onScan: (value: string) => void;
  onError?: (error: string) => void;
  className?: string;
  continuous?: boolean;
  cooldownMs?: number;
};

export function QRCodeScanner({
  onScan,
  onError,
  className,
  continuous = false,
  cooldownMs = 1200,
}: Props) {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const zxingRef = useRef<any>(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const lastScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });

  const stop = useCallback(async () => {
    try { if (zxingRef.current?.reset) zxingRef.current.reset(); } catch {}
    try {
      const v = videoRef.current;
      const s = v?.srcObject as MediaStream | null;
      s?.getTracks?.().forEach((tr) => tr.stop());
      if (v) v.srcObject = null;
    } catch {}
    setActive(false);
  }, []);

  const emitScan = useCallback(async (raw: string) => {
    const v = String(raw ?? "").trim();
    if (!v) return;
    const now = Date.now();
    const last = lastScanRef.current;
    if (last.value === v && now - last.at < cooldownMs) return;
    lastScanRef.current = { value: v, at: now };
    onScan(v);
    if (!continuous) await stop();
  }, [cooldownMs, continuous, onScan, stop]);

  const start = useCallback(async () => {
    setErr(null);
    const v = videoRef.current;
    if (!v) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      v.srcObject = stream;
      await v.play();
      setActive(true);

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        let cancelled = false;
        const loop = async () => {
          if (cancelled) return;
          try {
            const codes = await detector.detect(v);
            if (codes?.length) await emitScan(String(codes[0].rawValue ?? ""));
          } catch {}
          requestAnimationFrame(loop);
        };
        loop();
        return () => { cancelled = true; };
      }

      const mod = await import("@zxing/browser");
      const reader = new mod.BrowserQRCodeReader();
      zxingRef.current = reader;

      reader.decodeFromVideoElement(v, (result: any, error: any) => {
        if (result?.getText) void emitScan(String(result.getText() ?? ""));
        else if (error && error.name !== "NotFoundException") { /* ignore */ }
      });
    } catch (e: any) {
      const msg = e?.message ?? "Camera access denied";
      setErr(msg);
      onError?.(msg);
      await stop();
    }
  }, [emitScan, onError, stop]);

  useEffect(() => {
    void start();
    return () => { void stop(); };
  }, [start, stop]);

  return (
    <div className={className}>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-300" />
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("QR Scanner", "QR Scanner")}</div>
              <div className="text-xs text-white/60">
                {continuous ? t("Batch scan mode", "Batch scan mode") : t("Single scan mode", "Single scan mode")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-white/10" onClick={() => void start()}>
              <RefreshCw className="h-4 w-4 mr-2" /> {t("Restart", "ပြန်စ")}
            </Button>
            <Button variant="outline" className="border-white/10" onClick={() => void stop()}>
              <XCircle className="h-4 w-4 mr-2" /> {t("Stop", "ပိတ်")}
            </Button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-[340px] object-cover opacity-90" />
        </div>

        {err ? <div className="mt-3 text-sm text-rose-300">{err}</div> : null}
        <div className="mt-2 text-[10px] font-mono text-white/50">
          {active ? t("Camera active", "ကင်မရာဖွင့်ထားသည်") : t("Camera stopped", "ကင်မရာပိတ်ထားသည်")}
        </div>
      </div>
    </div>
  );
}

export default QRCodeScanner;
