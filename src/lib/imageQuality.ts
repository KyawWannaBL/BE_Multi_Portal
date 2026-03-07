export type ImageQualityResult = {
  pass: boolean;
  score: number; // 0..100
  issues: string[];
  metrics: {
    width: number;
    height: number;
    brightnessMean: number; // 0..255
    contrastStd: number; // 0..128
    blurVariance: number; // higher is sharper
  };
};

/**
 * EN: Enterprise quality gate for label photos.
 * MM: Label photo အတွက် quality စည်းမျဉ်းများ (blur/brightness/resolution/contrast)
 *
 * Thresholds are intentionally conservative for field use.
 */
export async function analyzeImageQuality(dataUrl: string): Promise<ImageQualityResult> {
  const img = await loadImage(dataUrl);
  const { width, height } = img;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  // brightness mean + contrast std
  let sum = 0;
  let sum2 = 0;
  const n = width * height;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    sum += y;
    sum2 += y * y;
  }
  const mean = sum / n;
  const variance = Math.max(0, sum2 / n - mean * mean);
  const std = Math.sqrt(variance);

  // blur variance via simple laplacian (downsample for speed)
  const blurVar = laplacianVariance(data, width, height);

  // thresholds (tuneable)
  const issues: string[] = [];
  const minW = 900;
  const minH = 650;
  const minBlur = 45;     // sharper above
  const minStd = 22;      // contrast
  const minBright = 55;   // avoid too dark
  const maxBright = 215;  // avoid too bright

  if (width < minW || height < minH) issues.push(`LOW_RESOLUTION (${width}x${height})`);
  if (blurVar < minBlur) issues.push(`BLUR_TOO_HIGH (variance=${blurVar.toFixed(1)})`);
  if (std < minStd) issues.push(`LOW_CONTRAST (std=${std.toFixed(1)})`);
  if (mean < minBright) issues.push(`TOO_DARK (mean=${mean.toFixed(1)})`);
  if (mean > maxBright) issues.push(`TOO_BRIGHT (mean=${mean.toFixed(1)})`);

  // score composition
  let score = 100;
  if (width < minW || height < minH) score -= 25;
  if (blurVar < minBlur) score -= 35;
  if (std < minStd) score -= 15;
  if (mean < minBright || mean > maxBright) score -= 15;
  score = Math.max(0, Math.min(100, score));

  return {
    pass: issues.length === 0,
    score,
    issues,
    metrics: {
      width,
      height,
      brightnessMean: mean,
      contrastStd: std,
      blurVariance: blurVar,
    },
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function laplacianVariance(rgba: Uint8ClampedArray, w: number, h: number): number {
  // Downsample stride for speed
  const step = Math.max(1, Math.floor(Math.min(w, h) / 420));
  const gray = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    return 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
  };

  let sum = 0;
  let sum2 = 0;
  let count = 0;

  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const c = gray(x, y);
      const lap =
        gray(x - 1, y) + gray(x + 1, y) + gray(x, y - 1) + gray(x, y + 1) - 4 * c;
      sum += lap;
      sum2 += lap * lap;
      count++;
    }
  }

  if (!count) return 0;
  const mean = sum / count;
  return Math.max(0, sum2 / count - mean * mean);
}
