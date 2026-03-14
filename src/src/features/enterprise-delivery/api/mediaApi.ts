import { enterpriseApi } from "./client";
import type { EvidenceAsset } from "../types/domain";

export async function requestPresignedUpload(payload: {
  fileName: string;
  mimeType: string;
  bucket?: string;
  deliveryId?: string;
  evidenceType?: string;
}) {
  return enterpriseApi.post<{
    bucket: string;
    path: string;
    uploadUrl: string;
    publicUrl?: string;
    headers?: Record<string, string>;
  }>("/media/presign", payload);
}

export async function uploadFileToPresignedUrl(options: {
  uploadUrl: string;
  file: File;
  headers?: Record<string, string>;
}) {
  const response = await fetch(options.uploadUrl, {
    method: "PUT",
    headers: options.headers || { "Content-Type": options.file.type || "application/octet-stream" },
    body: options.file,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
}

export async function registerEvidence(payload: {
  deliveryId: string;
  eventId?: string;
  evidenceType: string;
  storageBucket: string;
  storagePath: string;
  fileName?: string;
  mimeType?: string;
  qualityScore?: number;
  metadata?: Record<string, unknown>;
}) {
  return enterpriseApi.post<EvidenceAsset>("/media/evidence", payload);
}
