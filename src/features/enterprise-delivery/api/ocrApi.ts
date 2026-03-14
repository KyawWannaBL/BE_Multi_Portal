import { enterpriseApi } from "./client";
import type { OcrExtractionResult } from "../types/domain";

export async function extractFromEvidence(payload: {
  deliveryId?: string;
  evidenceId?: string;
  sourceBucket?: string;
  sourcePath?: string;
}) {
  return enterpriseApi.post<OcrExtractionResult>("/ocr/extract", payload);
}

export async function extractFromRawText(payload: { rawText: string }) {
  return enterpriseApi.post<OcrExtractionResult>("/ocr/normalize", payload);
}
