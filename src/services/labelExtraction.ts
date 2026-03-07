import { analyzeImageQuality, type ImageQualityResult } from "@/lib/imageQuality";

export type ExtractedLabel = {
  awb: string | null;
  receiver: string | null;
  phone: string | null;
  address: string | null;
  codAmount: number | null;

  barcodeValue: string | null;
  ocrText: string;
  quality: ImageQualityResult;
};

function normalizePhone(s: string): string | null {
  const m = s.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
  if (!m?.[1]) return null;
  return m[1].replace(/\s+/g, "");
}

function findAwb(text: string): string | null {
  const m = text.match(/(?:AWB|WAYBILL|WB|TT|Tracking)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
  if (m?.[1]) return m[1].toUpperCase();
  // fallback: long alnum token
  const m2 = text.match(/\b([A-Z0-9]{10,})\b/);
  return m2?.[1] ? m2[1].toUpperCase() : null;
}

function findCod(text: string): number | null {
  const m = text.match(/(?:COD|C\.O\.D)\s*[:#-]?\s*([0-9,\.]+)/i);
  if (!m?.[1]) return null;
  const v = Number(String(m[1]).replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
}

function guessReceiver(lines: string[]): string | null {
  for (const l of lines) {
    if (l.length > 3 && l.length <= 40 && !/\d/.test(l) && !/address|awb|waybill|cod|phone/i.test(l)) {
      return l;
    }
  }
  return null;
}

function guessAddress(lines: string[]): string | null {
  const cleaned = lines.filter((l) => l.length >= 8);
  if (!cleaned.length) return null;
  // take last 2-4 lines as address-ish
  const last = cleaned.slice(-4).join(" ");
  return last || null;
}

async function decodeBarcodeFromImage(dataUrl: string): Promise<string | null> {
  try {
    const mod = await import("@zxing/browser");
    const reader = new mod.BrowserMultiFormatReader();
    const result = await reader.decodeFromImageUrl(dataUrl);
    const txt = result?.getText?.();
    return txt ? String(txt).trim() : null;
  } catch {
    return null;
  }
}

async function runOcr(dataUrl: string): Promise<string> {
  const mod = await import("tesseract.js");
  const res = await mod.recognize(dataUrl, "eng", { logger: () => {} } as any);
  return String(res?.data?.text ?? "");
}

/**
 * EN: Intake pipeline. Quality gate → barcode → OCR → parse.
 * MM: Quality စစ် → barcode/QR → OCR → parse
 */
export async function extractLabelFromImage(dataUrl: string): Promise<ExtractedLabel> {
  const quality = await analyzeImageQuality(dataUrl);
  const barcodeValue = await decodeBarcodeFromImage(dataUrl);

  const ocrText = quality.pass ? await runOcr(dataUrl) : "";
  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const awb = barcodeValue ? findAwb(barcodeValue) ?? barcodeValue : findAwb(ocrText);
  const phone = normalizePhone(ocrText);
  const receiver = guessReceiver(lines);
  const address = guessAddress(lines);
  const codAmount = findCod(ocrText);

  return {
    awb,
    receiver,
    phone,
    address,
    codAmount,
    barcodeValue,
    ocrText,
    quality,
  };
}
