/**
 * EN: Parcel photo capture shared types
 * MM: Parcel photo capture အတွက် shared type များ
 */

export type ParcelPhotoCheckResult = {
  isClear: boolean;
  score: number;
  threshold: number;
  messageEn: string;
  messageMy: string;
};

export type ParcelOcrResult = {
  rawText: string;
  lines: string[];
  extracted: {
    trackingNo?: string | null;
    wayNo?: string | null;
    phone?: string | null;
    recipientName?: string | null;
    address?: string | null;
  };
};

export type ParcelPhotoWorkflowInput = {
  shipmentId?: string | null;
  parcelId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  imageFile?: File | null;
  imageDataUrl?: string | null;
  notes?: string | null;
};

export type ParcelExcelRow = {
  shipment_id?: string | null;
  parcel_id?: string | null;
  tracking_no?: string | null;
  way_no?: string | null;
  recipient_name?: string | null;
  phone?: string | null;
  address?: string | null;
  raw_text?: string | null;
  clarity_score?: number | null;
  image_url?: string | null;
  created_at?: string | null;
};
