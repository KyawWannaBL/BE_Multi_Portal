/**
 * EN: Parcel photo capture workflow service
 * MM: Parcel photo capture workflow service
 */

import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { checkImageClarity } from "../utils/blurCheck";
import { extractTextFromParcelImage } from "./photoOcrService";
import type {
  ParcelExcelRow,
  ParcelPhotoWorkflowInput,
} from "../types";

export async function uploadParcelPhoto(input: ParcelPhotoWorkflowInput) {
  const file = input.imageFile;
  if (!file) {
    throw new Error("Image file is required.");
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `parcel-${Date.now()}.${ext}`;
  const storagePath = `parcel-photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("parcel-assets")
    .upload(storagePath, file, {
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Photo upload failed.");
  }

  const { data } = supabase.storage
    .from("parcel-assets")
    .getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: data?.publicUrl || null,
  };
}

export async function processParcelPhoto(input: ParcelPhotoWorkflowInput) {
  if (!input.imageFile && !input.imageDataUrl) {
    throw new Error("Parcel image is required.");
  }

  const clarity = await checkImageClarity(input.imageFile || input.imageDataUrl || "");
  if (!clarity.isClear) {
    return {
      ok: false,
      clarity,
      ocr: null,
      upload: null,
      excelRow: null,
    };
  }

  const upload = input.imageFile ? await uploadParcelPhoto(input) : { path: null, publicUrl: null };
  const ocr = await extractTextFromParcelImage({
    imageFile: input.imageFile || null,
    imageDataUrl: input.imageDataUrl || null,
  });

  const excelRow: ParcelExcelRow = {
    shipment_id: input.shipmentId ?? null,
    parcel_id: input.parcelId ?? null,
    tracking_no: ocr.extracted.trackingNo ?? null,
    way_no: ocr.extracted.wayNo ?? null,
    recipient_name: ocr.extracted.recipientName ?? null,
    phone: ocr.extracted.phone ?? null,
    address: ocr.extracted.address ?? null,
    raw_text: ocr.rawText || null,
    clarity_score: clarity.score,
    image_url: upload.publicUrl ?? null,
    created_at: new Date().toISOString(),
  };

  return {
    ok: true,
    clarity,
    ocr,
    upload,
    excelRow,
  };
}

export function exportParcelRowsToExcel(rows: ParcelExcelRow[], fileName = "parcel-photo-extracts.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(rows || []);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ParcelExtracts");
  XLSX.writeFile(workbook, fileName);
}
