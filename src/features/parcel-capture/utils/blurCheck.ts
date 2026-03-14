/**
 * EN: Simple client-side blur / clarity check
 * MM: Client-side blur / clarity check
 */

import type { ParcelPhotoCheckResult } from "../types";

function variance(values: number[]): number {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

export async function imageFileToBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

export async function imageDataUrlToBitmap(dataUrl: string): Promise<ImageBitmap> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

export async function checkImageClarity(input: File | string, threshold = 180): Promise<ParcelPhotoCheckResult> {
  const bitmap =
    typeof input === "string"
      ? await imageDataUrlToBitmap(input)
      : await imageFileToBitmap(input);

  const width = Math.min(320, bitmap.width);
  const height = Math.max(1, Math.round((bitmap.height / bitmap.width) * width));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      isClear: false,
      score: 0,
      threshold,
      messageEn: "Could not evaluate image clarity.",
      messageMy: "ပုံ၏ကြည်လင်မှုကို မစစ်ဆေးနိုင်ပါ။",
    };
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray.push(g);
  }

  const laplacian: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const v =
        4 * gray[i] -
        gray[i - 1] -
        gray[i + 1] -
        gray[i - width] -
        gray[i + width];
      laplacian.push(v);
    }
  }

  const score = variance(laplacian);
  const isClear = score >= threshold;

  return {
    isClear,
    score,
    threshold,
    messageEn: isClear ? "Image looks clear." : "Image looks blurry. Please retake the photo.",
    messageMy: isClear ? "ပုံကြည်လင်ပါသည်။" : "ပုံမရှင်းပါ။ ကျေးဇူးပြု၍ ပြန်ရိုက်ပါ။",
  };
}
