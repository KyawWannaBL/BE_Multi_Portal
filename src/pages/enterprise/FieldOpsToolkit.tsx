import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ImageUp,
  Pencil,
  QrCode,
  RefreshCcw,
  ScanLine,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";

export type ScanResult = {
  rawText: string;
  source: "camera" | "image" | "manual";
  symbology?: string;
  detectedAt: string;
};

export type CargoExtractRow = {
  trackingNo: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  township: string;
  note: string;
};

export type PhotoAssessment = {
  width: number;
  height: number;
  brightness: number;
  sharpness: number;
  contrast: number;
  score: number;
  issues: string[];
  guidance: string[];
  canUseForOcr: boolean;
};

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function computeImageAssessment(
  imageData: ImageData,
  width: number,
  height: number
): PhotoAssessment {
  const { data } = imageData;
  let brightness = 0;
  let contrastAccumulator = 0;
  let laplacianAccumulator = 0;
  let pixels = 0;
  const grayscale: number[] = new Array(width * height).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale[pixels] = g;
    brightness += g;
    pixels += 1;
  }

  brightness = brightness / Math.max(1, pixels);

  for (let i = 0; i < grayscale.length; i += 1) {
    contrastAccumulator += Math.abs(grayscale[i] - brightness);
  }

  const contrast = contrastAccumulator / Math.max(1, grayscale.length);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const laplacian =
        4 * grayscale[idx] -
        grayscale[idx - 1] -
        grayscale[idx + 1] -
        grayscale[idx - width] -
        grayscale[idx + width];
      laplacianAccumulator += Math.abs(laplacian);
    }
  }

  const sharpness = laplacianAccumulator / Math.max(1, (width - 2) * (height - 2));

  const issues: string[] = [];
  const guidance: string[] = [];

  if (width < 1000 || height < 1000) {
    issues.push("Low resolution");
    guidance.push("Move closer and fill more of the frame with the parcel or label.");
  }

  if (brightness < 75) {
    issues.push("Underexposed");
    guidance.push("Increase lighting or use flash carefully without blowing out the label.");
  }

  if (brightness > 220) {
    issues.push("Overexposed");
    guidance.push("Reduce glare and angle the device away from direct light reflections.");
  }

  if (sharpness < 18) {
    issues.push("Blur detected");
    guidance.push("Hold the camera steady for one second and tap to focus before capture.");
  }

  if (contrast < 22) {
    issues.push("Low contrast");
    guidance.push("Use a darker background behind the parcel and avoid washed-out labels.");
  }

  const score = Math.max(
    20,
    Math.min(
      100,
      100 -
        (width < 1000 || height < 1000 ? 18 : 0) -
        (brightness < 75 ? 16 : 0) -
        (brightness > 220 ? 14 : 0) -
        (sharpness < 18 ? 24 : 0) -
        (contrast < 22 ? 12 : 0)
    )
  );

  if (!issues.length) {
    guidance.push("Photo quality looks acceptable for OCR and proof-of-condition checks.");
  }

  return {
    width,
    height,
    brightness: Number(brightness.toFixed(1)),
    sharpness: Number(sharpness.toFixed(1)),
    contrast: Number(contrast.toFixed(1)),
    score,
    issues,
    guidance,
    canUseForOcr: score >= 65,
  };
}

export async function analyzePhotoFile(file: File): Promise<{
  dataUrl: string;
  assessment: PhotoAssessment;
}> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return {
      dataUrl,
      assessment: {
        width: 0,
        height: 0,
        brightness: 0,
        sharpness: 0,
        contrast: 0,
        score: 50,
        issues: ["Canvas unavailable"],
        guidance: ["Browser image analysis is not available on this device."],
        canUseForOcr: false,
      },
    };
  }

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);

  return {
    dataUrl,
    assessment: computeImageAssessment(imageData, img.width, img.height),
  };
}

export function parseCargoTextToRows(text: string): CargoExtractRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: CargoExtractRow[] = [];
  let current: Partial<CargoExtractRow> = {};

  const push = () => {
    const row: CargoExtractRow = {
      trackingNo: String(current.trackingNo || "").trim(),
      senderName: String(current.senderName || "").trim(),
      senderPhone: String(current.senderPhone || "").trim(),
      receiverName: String(current.receiverName || "").trim(),
      receiverPhone: String(current.receiverPhone || "").trim(),
      address: String(current.address || "").trim(),
      township: String(current.township || "").trim(),
      note: String(current.note || "").trim(),
    };

    if (
      row.trackingNo ||
      row.receiverName ||
      row.receiverPhone ||
      row.address ||
      row.senderName
    ) {
      rows.push(row);
    }

    current = {};
  };

  for (const line of lines) {
    const trackingMatch = line.match(
      /(?:AWB|WAYBILL|TRACK(?:ING)?|WB|TT|ID)\s*[:#-]?\s*([A-Z0-9-]{6,})/i
    );
    if (trackingMatch?.[1]) {
      if (current.trackingNo) push();
      current.trackingNo = trackingMatch[1].toUpperCase();
      continue;
    }

    const phoneMatch = line.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
    if (phoneMatch?.[1]) {
      if (!current.receiverPhone) current.receiverPhone = phoneMatch[1].replace(/\s+/g, "");
      else if (!current.senderPhone) current.senderPhone = phoneMatch[1].replace(/\s+/g, "");
      continue;
    }

    const senderMatch = line.match(/(?:sender|shipper|from)\s*[:#-]?\s*(.+)$/i);
    if (senderMatch?.[1]) {
      current.senderName = senderMatch[1];
      continue;
    }

    const receiverMatch = line.match(/(?:receiver|consignee|to)\s*[:#-]?\s*(.+)$/i);
    if (receiverMatch?.[1]) {
      current.receiverName = receiverMatch[1];
      continue;
    }

    const townshipMatch = line.match(/(?:township|town)\s*[:#-]?\s*(.+)$/i);
    if (townshipMatch?.[1]) {
      current.township = townshipMatch[1];
      continue;
    }

    if (!current.receiverName && !/\d/.test(line) && line.length <= 40) {
      current.receiverName = line;
      continue;
    }

    if (!current.address) current.address = line;
    else current.address += ` ${line}`;
  }

  push();
  return rows.slice(0, 500);
}

export function DeviceFriendlyQrScanner({
  title,
  helperText,
  placeholder = "Scan or paste code",
  onDetected,
}: {
  title: string;
  helperText?: string;
  placeholder?: string;
  onDetected: (result: ScanResult) => void;
}) {
  const [manualValue, setManualValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<string>("Idle");
  const [lastValue, setLastValue] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  const supportsBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;

  const stopScanner = useCallbackSafe(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setScanning(false);
    setStatus("Camera stopped");
  });

  useEffect(() => () => stopScanner(), [stopScanner]);

  const emit = (rawText: string, source: ScanResult["source"], symbology?: string) => {
    const clean = String(rawText || "").trim();
    if (!clean) return;
    setLastValue(clean);
    setManualValue(clean);
    onDetected({
      rawText: clean,
      source,
      symbology,
      detectedAt: new Date().toISOString(),
    });
  };

  const startScanner = async () => {
    if (!supportsBarcodeDetector) {
      setStatus("This browser does not support live barcode detection. Use manual or image mode.");
      return;
    }

    try {
      const BarcodeDetectorCtor = (window as any).BarcodeDetector;
      detectorRef.current = new BarcodeDetectorCtor({
        formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"],
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setScanning(true);
      setStatus("Camera active. Point the code inside the frame.");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      timerRef.current = window.setInterval(async () => {
        try {
          if (!videoRef.current || !detectorRef.current) return;
          const codes = await detectorRef.current.detect(videoRef.current);
          if (Array.isArray(codes) && codes.length > 0) {
            const code = codes[0];
            emit(code.rawValue || code.rawText || "", "camera", code.format);
            setStatus(`Detected ${code.rawValue || code.rawText || "code"}`);
            stopScanner();
          }
        } catch {
          // no-op for scan loop
        }
      }, 800);
    } catch (error) {
      console.error(error);
      setStatus("Camera access failed. Use image upload or manual entry.");
      stopScanner();
    }
  };

  const handleImageDetect = async (file: File | undefined) => {
    if (!file) return;

    if (!supportsBarcodeDetector) {
      setStatus("Image QR detect is not supported on this browser. Enter code manually.");
      return;
    }

    try {
      setStatus("Analyzing uploaded image…");
      const BarcodeDetectorCtor = (window as any).BarcodeDetector;
      const detector = new BarcodeDetectorCtor({
        formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"],
      });

      const dataUrl = await fileToDataUrl(file);
      const img = await loadImage(dataUrl);
      const bitmap = await createImageBitmap(img);
      const codes = await detector.detect(bitmap);

      if (codes?.length) {
        const code = codes[0];
        emit(code.rawValue || code.rawText || "", "image", code.format);
        setStatus(`Detected ${code.rawValue || code.rawText || "code"}`);
      } else {
        setStatus("No code found in the uploaded image.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Image scan failed. Try a clearer image or manual entry.");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 text-white shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            <QrCode className="h-4 w-4" />
            {title}
          </div>
          {helperText ? <p className="mt-2 text-xs text-white/60">{helperText}</p> : null}
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase text-emerald-300">
          {supportsBarcodeDetector ? "camera-ready" : "manual fallback"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50">
            <video ref={videoRef} className="h-[220px] w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void startScanner()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-500"
            >
              <ScanLine className="h-4 w-4" />
              Start camera
            </button>
            <button
              type="button"
              onClick={stopScanner}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Stop
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10">
              <ImageUp className="h-4 w-4" />
              Scan image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleImageDetect(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
            Manual / fallback input
          </label>
          <input
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => emit(manualValue, "manual")}
            disabled={!manualValue.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-sky-500 disabled:opacity-40"
          >
            <UploadCloud className="h-4 w-4" />
            Use code
          </button>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Scanner status</div>
            <div className="mt-2 text-sm text-white">{status}</div>
            {lastValue ? (
              <div className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2 font-mono text-xs text-emerald-300">
                Last detected: {lastValue}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhotoEvidenceCapture({
  title,
  helperText,
  onReady,
}: {
  title: string;
  helperText?: string;
  onReady: (payload: { file: File; dataUrl: string; assessment: PhotoAssessment }) => void;
}) {
  const [preview, setPreview] = useState<string>("");
  const [assessment, setAssessment] = useState<PhotoAssessment | null>(null);
  const [busy, setBusy] = useState(false);

  const qualityTone = useMemo(() => {
    if (!assessment) return "bg-white/5 text-white/70 border-white/10";
    if (assessment.score >= 85) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    if (assessment.score >= 65) return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    return "bg-rose-500/10 text-rose-300 border-rose-500/20";
  }, [assessment]);

  const onFileChange = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const result = await analyzePhotoFile(file);
      setPreview(result.dataUrl);
      setAssessment(result.assessment);
      onReady({ file, dataUrl: result.dataUrl, assessment: result.assessment });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 text-white shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-amber-300">
            <Camera className="h-4 w-4" />
            {title}
          </div>
          {helperText ? <p className="mt-2 text-xs text-white/60">{helperText}</p> : null}
        </div>
        {assessment ? (
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${qualityTone}`}>
            quality {assessment.score}/100
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amber-400/30 bg-amber-500/5 px-6 py-8 text-center hover:border-amber-400/60 hover:bg-amber-500/10">
            <Camera className="mb-3 h-8 w-8 text-amber-300" />
            <div className="text-sm font-bold text-white">Capture parcel or label photo</div>
            <div className="mt-1 text-xs text-white/60">Works with mobile camera and desktop upload.</div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => void onFileChange(e.target.files?.[0])}
            />
          </label>

          {preview ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <img src={preview} alt="parcel" className="max-h-[320px] w-full object-contain" />
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Quality monitor</div>
            {busy ? (
              <div className="mt-3 text-sm text-white/70">Analyzing photo…</div>
            ) : assessment ? (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                  <Metric label="Resolution" value={`${assessment.width}×${assessment.height}`} />
                  <Metric label="Brightness" value={assessment.brightness} />
                  <Metric label="Sharpness" value={assessment.sharpness} />
                  <Metric label="Contrast" value={assessment.contrast} />
                </div>

                <div className="space-y-2">
                  {assessment.issues.length ? (
                    assessment.issues.map((issue) => (
                      <div key={issue} className="flex items-start gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Photo passes initial OCR and proof-of-condition quality checks.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-white/60">No photo analyzed yet.</div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
              <Sparkles className="h-4 w-4 text-sky-300" />
              Guidance
            </div>
            <div className="space-y-2 text-xs text-white/75">
              {(assessment?.guidance || [
                "Keep the entire parcel and shipping label inside the frame.",
                "Avoid dark floors or reflective plastic beneath the parcel.",
                "Capture a second close-up shot when the barcode is partially wrinkled.",
              ]).map((tip) => (
                <div key={tip} className="rounded-xl bg-white/5 px-3 py-2">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function SignaturePadCanvas({
  title,
  subtitle,
  onChange,
}: {
  title?: string;
  subtitle?: string;
  onChange: (signatureDataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.25;
  }, []);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const begin = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setDrawing(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const point = getPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const end = () => {
    const canvas = canvasRef.current;
    setDrawing(false);
    if (canvas) {
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 text-white shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-sky-300">
            <Pencil className="h-4 w-4" />
            {title || "Electronic signature"}
          </div>
          {subtitle ? <p className="mt-2 text-xs text-white/60">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10"
        >
          <XCircle className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
        <canvas
          ref={canvasRef}
          width={720}
          height={220}
          className="h-[220px] w-full touch-none bg-gradient-to-b from-white/[0.03] to-transparent"
          onPointerDown={begin}
          onPointerMove={draw}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
    </div>
  );
}

function useCallbackSafe<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(() => ((...args: any[]) => ref.current(...args)) as T, []);
}
