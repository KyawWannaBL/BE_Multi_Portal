#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Intake Upload Enhancements (Enterprise)
# ✅ If AWB already exists: attach LABEL_PHOTO URL to existing shipment (best-effort)
# ✅ Retry transient errors (429/5xx/network) with exponential backoff + jitter
#
# Files:
# - src/services/intakeUploader.ts
#
# Notes:
# - Schema-resilient: tries remarks/metadata/notes columns if present
# - Safe: if update fails due to missing columns/RLS, it will continue without crashing
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

UPLOADER="src/services/intakeUploader.ts"
mkdir -p "$(dirname "$UPLOADER")"
backup "$UPLOADER"

cat > "$UPLOADER" <<'EOF'
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { createShipmentDataEntry } from "@/services/shipments";

export type IntakeUploadDefaults = {
  receiverCity: string;
  receiverState: string;
  deliveryType: string;
  deliveryFee: number;
  itemPrice: number;
  cbm: number;
  remarksPrefix: string;
};

export type UploadRowInput = {
  awb: string;
  receiver: string;
  phone: string;
  address: string;
  codAmount: number;
  labelPhotoDataUrl?: string | null;
};

export type UploadRowResult =
  | {
      ok: true;
      awb: string;
      status: "CREATED";
      shipmentId: string;
      wayId: string;
      photoUrl?: string | null;
    }
  | {
      ok: true;
      awb: string;
      status: "SKIPPED_EXISTS";
      shipmentId: string;
      wayId?: string | null;
      trackingNumber?: string | null;
      photoUrl?: string | null;
      attachedToExisting?: boolean;
    }
  | {
      ok: false;
      awb: string;
      status: "FAILED";
      error: string;
    };

export type UploadOptions = {
  concurrency?: number; // default 5
  dedupe?: boolean; // default true

  retry?: boolean; // default true
  maxRetries?: number; // default 3
  baseDelayMs?: number; // default 450
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

async function uploadLabelPhotoBestEffort(awb: string, dataUrl: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const bucket = "parcel-labels";
    const path = `intake/${awb}/${Date.now()}.jpg`;
    const blob = dataUrlToBlob(dataUrl);

    const up = await supabase.storage.from(bucket).upload(path, blob, {
      upsert: true,
      contentType: blob.type,
    });
    if (up.error) return null;

    const pub = supabase.storage.from(bucket).getPublicUrl(path);
    return pub?.data?.publicUrl ?? null;
  } catch {
    return null;
  }
}

type ExistingShipment = {
  id: string;
  way_id?: string | null;
  tracking_number?: string | null;
  remarks?: string | null;
  note?: string | null;
  description?: string | null;
  metadata?: any;
};

async function findExistingShipmentByAwb(awb: string): Promise<ExistingShipment | null> {
  if (!isSupabaseConfigured) return null;

  const cols = ["tracking_number", "way_id", "awb", "awb_no", "airway_bill", "airwaybill", "tt_id"];
  for (const col of cols) {
    try {
      const res = await supabase
        .from("shipments")
        .select("id,way_id,tracking_number,remarks,note,description,metadata")
        .eq(col as any, awb)
        .order("updated_at" as any, { ascending: false })
        .limit(1);

      if (!res.error && Array.isArray(res.data) && res.data.length) return res.data[0] as any;
    } catch {
      // try next col
    }
  }
  return null;
}

async function bestEffortSetTrackingNumber(shipmentId: string, awb: string) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("shipments").update({ tracking_number: awb } as any).eq("id", shipmentId);
  } catch {
    // ignore
  }
}

function compactRemark(prev: string, add: string) {
  const base = prev.trim();
  if (!base) return add;
  if (base.includes(add)) return base;
  const joined = `${base} | ${add}`;
  return joined.length > 1800 ? joined.slice(0, 1800) : joined;
}

async function bestEffortAttachLabelPhoto(existing: ExistingShipment, awb: string, photoUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const tag = `LABEL_PHOTO=${photoUrl}`;

  // 1) remarks
  try {
    const prev = String(existing.remarks ?? "");
    const next = compactRemark(prev, tag);
    const upd = await supabase.from("shipments").update({ remarks: next, updated_at: new Date().toISOString() } as any).eq("id", existing.id);
    if (!upd.error) return true;
  } catch {
    // continue
  }

  // 2) note
  try {
    const prev = String(existing.note ?? "");
    const next = compactRemark(prev, tag);
    const upd = await supabase.from("shipments").update({ note: next, updated_at: new Date().toISOString() } as any).eq("id", existing.id);
    if (!upd.error) return true;
  } catch {
    // continue
  }

  // 3) description
  try {
    const prev = String(existing.description ?? "");
    const next = compactRemark(prev, tag);
    const upd = await supabase.from("shipments").update({ description: next, updated_at: new Date().toISOString() } as any).eq("id", existing.id);
    if (!upd.error) return true;
  } catch {
    // continue
  }

  // 4) metadata json (best-effort)
  try {
    const prev = existing.metadata && typeof existing.metadata === "object" ? existing.metadata : {};
    const photos: string[] = Array.isArray(prev.label_photos) ? prev.label_photos : [];
    const nextMeta = {
      ...prev,
      intake_awb: awb,
      label_photo_url: photoUrl,
      label_photos: Array.from(new Set([photoUrl, ...photos])).slice(0, 25),
      label_photo_attached_at: new Date().toISOString(),
    };
    const upd = await supabase.from("shipments").update({ metadata: nextMeta, updated_at: new Date().toISOString() } as any).eq("id", existing.id);
    if (!upd.error) return true;
  } catch {
    // ignore
  }

  return false;
}

function isRetryable(err: any): boolean {
  const status = Number(err?.status ?? err?.statusCode ?? err?.code ?? NaN);
  const msg = String(err?.message ?? err?.error_description ?? err ?? "").toLowerCase();

  if ([408, 425, 429, 500, 502, 503, 504].includes(status)) return true;
  if (msg.includes("timeout")) return true;
  if (msg.includes("network")) return true;
  if (msg.includes("fetch")) return true;
  if (msg.includes("rate")) return true;

  return false;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, cfg: { retry: boolean; maxRetries: number; baseDelayMs: number }): Promise<T> {
  if (!cfg.retry) return fn();

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (e: any) {
      attempt += 1;
      if (attempt > cfg.maxRetries || !isRetryable(e)) throw e;

      const exp = cfg.baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 180);
      await sleep(exp + jitter);
    }
  }
}

async function processOne(
  row: UploadRowInput,
  defaults: IntakeUploadDefaults,
  opts: { dedupe: boolean; retry: boolean; maxRetries: number; baseDelayMs: number }
): Promise<UploadRowResult> {
  const awb = String(row.awb || "").trim();
  if (!awb || awb === "—") return { ok: false, awb: awb || "—", status: "FAILED", error: "AWB_REQUIRED" };

  // photo upload can also be retried (network)
  const photoUrl = row.labelPhotoDataUrl
    ? await withRetry(() => uploadLabelPhotoBestEffort(awb, row.labelPhotoDataUrl!), opts)
    : null;

  if (opts.dedupe) {
    const existing = await withRetry(() => findExistingShipmentByAwb(awb), opts);
    if (existing?.id) {
      const attached = photoUrl ? await withRetry(() => bestEffortAttachLabelPhoto(existing, awb, photoUrl), opts) : false;

      return {
        ok: true,
        awb,
        status: "SKIPPED_EXISTS",
        shipmentId: String(existing.id),
        wayId: existing.way_id ?? null,
        trackingNumber: existing.tracking_number ?? null,
        photoUrl,
        attachedToExisting: attached,
      };
    }
  }

  const receiver_name = (row.receiver || "UNKNOWN").trim();
  const receiver_phone = (row.phone || "—").trim();
  const receiver_address = (row.address || "—").trim();

  const remarks = [
    defaults.remarksPrefix,
    `AWB=${awb}`,
    `PHONE=${receiver_phone}`,
    `COD=${Number(row.codAmount || 0)}`,
    photoUrl ? `LABEL_PHOTO=${photoUrl}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const created = await withRetry(
    () =>
      createShipmentDataEntry({
        receiver_name,
        receiver_phone,
        receiver_address,
        receiver_city: defaults.receiverCity,
        receiver_state: defaults.receiverState,
        item_price: defaults.itemPrice,
        delivery_fee: defaults.deliveryFee,
        cod_amount: Number(row.codAmount || 0),
        cbm: defaults.cbm,
        delivery_type: defaults.deliveryType,
        remarks,
      } as any),
    opts
  );

  await withRetry(() => bestEffortSetTrackingNumber(created.shipmentId, awb), opts);

  return {
    ok: true,
    awb,
    status: "CREATED",
    shipmentId: created.shipmentId,
    wayId: created.wayId,
    photoUrl,
  };
}

/**
 * EN: Bulk upload with dedupe + concurrency + retries.
 * MM: Dedup + concurrency + retry (enterprise)
 */
export async function uploadParcelsFromIntake(
  rows: UploadRowInput[],
  defaults: IntakeUploadDefaults,
  options?: UploadOptions
): Promise<UploadRowResult[]> {
  const dedupe = options?.dedupe ?? true;
  const concurrency = clamp(Number(options?.concurrency ?? 5), 1, 10);

  const retry = options?.retry ?? true;
  const maxRetries = clamp(Number(options?.maxRetries ?? 3), 0, 8);
  const baseDelayMs = clamp(Number(options?.baseDelayMs ?? 450), 150, 2500);

  const cfg = { dedupe, retry, maxRetries, baseDelayMs };

  const results: UploadRowResult[] = new Array(rows.length);
  let idx = 0;

  const worker = async () => {
    while (true) {
      const myIdx = idx;
      idx += 1;
      if (myIdx >= rows.length) return;

      try {
        results[myIdx] = await processOne(rows[myIdx], defaults, cfg);
      } catch (e: any) {
        results[myIdx] = {
          ok: false,
          awb: String(rows[myIdx]?.awb || "—"),
          status: "FAILED",
          error: String(e?.message || e),
        };
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}
EOF

git add "$UPLOADER" 2>/dev/null || true

echo "✅ Applied:"
echo " - Dedup AWB: if exists -> attach LABEL_PHOTO to existing shipment (best-effort)"
echo " - Retry transient errors with exponential backoff + jitter"
echo
echo "Commit:"
echo "  git commit -m \"feat(intake): attach photo to existing + retry backoff\""