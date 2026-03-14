/**
 * EN: OCR extraction service
 * MM: OCR extraction service
 *
 * NOTE:
 * - Preferred production path is backend OCR API.
 * - Fallback client OCR can be added later.
 */

import type { ParcelOcrResult } from "../types";

function normalizeText(text: string): string {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function tryMatch(patterns: RegExp[], text: string): string | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractFields(rawText: string) {
  const text = normalizeText(rawText);

  return {
    trackingNo: tryMatch(
      [
        /tracking[\s:_-]*no[\s:_-]*([A-Z0-9-]+)/i,
        /awb[\s:_-]*([A-Z0-9-]+)/i,
        /\b(TRK[0-9A-Z-]+)\b/i,
      ],
      text
    ),
    wayNo: tryMatch(
      [
        /way[\s:_-]*no[\s:_-]*([A-Z0-9-]+)/i,
        /\b(WAY[0-9A-Z-]+)\b/i,
      ],
      text
    ),
    phone: tryMatch(
      [
        /\b(09[0-9]{7,11})\b/,
        /\b(\+?95[0-9]{7,14})\b/,
      ],
      text
    ),
    recipientName: tryMatch(
      [
        /recipient[\s:_-]*name[\s:_-]*([^\n]+)/i,
        /name[\s:_-]*([^\n]+)/i,
      ],
      text
    ),
    address: tryMatch(
      [
        /address[\s:_-]*([^\n]+)/i,
        /delivery address[\s:_-]*([^\n]+)/i,
      ],
      text
    ),
  };
}

export async function extractTextFromParcelImage(input: {
  imageFile?: File | null;
  imageDataUrl?: string | null;
}): Promise<ParcelOcrResult> {
  const form = new FormData();
  if (input.imageFile) form.append("file", input.imageFile);
  if (input.imageDataUrl) form.append("imageDataUrl", input.imageDataUrl);

  const response = await fetch("/api/ocr/parcel-image", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error("OCR service failed.");
  }

  const data = await response.json();
  const rawText = normalizeText(data?.text || "");
  const lines = rawText ? rawText.split("\n").map((x: string) => x.trim()).filter(Boolean) : [];
  const extracted = extractFields(rawText);

  return {
    rawText,
    lines,
    extracted,
  };
}
