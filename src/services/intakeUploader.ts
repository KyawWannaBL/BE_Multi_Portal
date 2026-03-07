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

  actorEmail?: string | null;
  actorRole?: string | null;
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

function errText(err: any): string {
  return String(err?.message ?? err?.error_description ?? err?.details ?? err ?? "");
}

function errCode(err: any): string {
  return String(err?.code ?? err?.error ?? err?.status ?? err?.statusCode ?? "");
}

function isPermanentError(err: any): boolean {
  const msg = errText(err).toLowerCase();
  const code = errCode(err).toLowerCase();
  const status = Number(err?.status ?? err?.statusCode ?? NaN);

  // Common permanent postgres codes
  const pg = String(err?.code ?? "");
  if (["42501", "42p01", "42703", "23505", "22p02"].includes(pg.toLowerCase())) return true;

  // RLS / permissions / auth
  if (msg.includes("row level security")) return true;
  if (msg.includes("rls")) return true;
  if (msg.includes("permission denied")) return true;
  if (msg.includes("insufficient privilege")) return true;
  if (msg.includes("jwt")) return true;
  if (msg.includes("auth")) return true;
  if (msg.includes("not authorized")) return true;
  if (msg.includes("unauthorized")) return true;
  if (msg.includes("forbidden")) return true;

  // Schema mismatch / column missing
  if (msg.includes("column") && msg.includes("does not exist")) return true;
  if (msg.includes("relation") && msg.includes("does not exist")) return true;
  if (msg.includes("invalid input syntax")) return true;
  if (msg.includes("violates")) return true;

  // HTTP permanent (all 4xx except 408/425/429)
  if (Number.isFinite(status) && status >= 400 && status < 500 && ![408, 425, 429].includes(status)) return true;

  // Supabase PostgREST-ish permanent hints
  if (code.includes("pgrst") && msg.includes("column")) return true;

  return false;
}

function isRetryable(err: any): boolean {
  if (isPermanentError(err)) return false;

  const status = Number(err?.status ?? err?.statusCode ?? NaN);
  const msg = errText(err).toLowerCase();

  if ([408, 425, 429, 500, 502, 503, 504].includes(status)) return true;
  if (msg.includes("timeout")) return true;
  if (msg.includes("network")) return true;
  if (msg.includes("fetch")) return true;
  if (msg.includes("rate")) return true;
  if (msg.includes("temporarily")) return true;

  return false;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  cfg: { retry: boolean; maxRetries: number; baseDelayMs: number }
): Promise<T> {
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

async function uploadLabelPhotoOnce(awb: string, dataUrl: string): Promise<string> {
  if (!isSupabaseConfigured) throw new Error("SUPABASE_NOT_CONFIGURED");

  const bucket = "parcel-labels";
  const path = `intake/${awb}/${Date.now()}.jpg`;
  const blob = dataUrlToBlob(dataUrl);

  const up = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: true,
    contentType: blob.type,
  });

  if (up.error) throw up.error;

  const pub = supabase.storage.from(bucket).getPublicUrl(path);
  const url = pub?.data?.publicUrl;
  if (!url) throw new Error("PUBLIC_URL_MISSING");
  return url;
}

async function uploadLabelPhotoResilient(
  awb: string,
  dataUrl: string,
  cfg: { retry: boolean; maxRetries: number; baseDelayMs: number }
): Promise<string | null> {
  try {
    return await withRetry(() => uploadLabelPhotoOnce(awb, dataUrl), cfg);
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
  } catch {}

  // 2) note
  try {
    const prev = String(existing.note ?? "");
    const next = compactRemark(prev, tag);
    const upd = await supabase.from("shipments").update({ note: next, updated_at: new Date().toISOString() } as any).eq("id", existing.id);
    if (!upd.error) return true;
  } catch {}

  // 3) description
  try {
    const prev = String(existing.description ?? "");
    const next = compactRemark(prev, tag);
    const upd = await supabase.from("shipments").update({ description: next, updated_at: new Date().toISOString() } as any).eq("id", existing.id);
    if (!upd.error) return true;
  } catch {}

  // 4) metadata json
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
  } catch {}

  return false;
}

/**
 * EN: Best-effort audit log.
 * MM: Audit log ကို best-effort ထည့်မည် (fail-safe)
 */
async function bestEffortAuditLog(params: {
  eventType: string;
  actorEmail?: string | null;
  actorRole?: string | null;
  shipmentId?: string | null;
  awb?: string | null;
  metadata?: Record<string, unknown>;
}, cfg: { retry: boolean; maxRetries: number; baseDelayMs: number }) {
  if (!isSupabaseConfigured) return;

  const row: any = {
    event_type: params.eventType,
    user_id: null,
    metadata: {
      actorEmail: params.actorEmail ?? null,
      actorRole: params.actorRole ?? null,
      shipmentId: params.shipmentId ?? null,
      awb: params.awb ?? null,
      ...(params.metadata ?? {}),
    },
  };

  try {
    await withRetry(async () => {
      const ins = await supabase.from("audit_logs").insert(row as any);
      if (ins.error) throw ins.error;
      return true;
    }, { ...cfg, maxRetries: Math.min(cfg.maxRetries, 2) });
  } catch {
    // ignore permanently
  }
}

async function processOne(
  row: UploadRowInput,
  defaults: IntakeUploadDefaults,
  cfg: { dedupe: boolean; retry: boolean; maxRetries: number; baseDelayMs: number }
): Promise<UploadRowResult> {
  const awb = String(row.awb || "").trim();
  if (!awb || awb === "—") return { ok: false, awb: awb || "—", status: "FAILED", error: "AWB_REQUIRED" };

  const photoUrl = row.labelPhotoDataUrl ? await uploadLabelPhotoResilient(awb, row.labelPhotoDataUrl, cfg) : null;

  if (cfg.dedupe) {
    const existing = await withRetry(() => findExistingShipmentByAwb(awb), cfg);
    if (existing?.id) {
      const attached = photoUrl ? await withRetry(() => bestEffortAttachLabelPhoto(existing, awb, photoUrl), cfg) : false;

      await bestEffortAuditLog({
        eventType: "INTAKE_LABEL_ATTACHED_EXISTING",
        actorEmail: row.actorEmail ?? null,
        actorRole: row.actorRole ?? null,
        shipmentId: String(existing.id),
        awb,
        metadata: {
          photoUrl,
          attached,
          trackingNumber: existing.tracking_number ?? null,
          wayId: existing.way_id ?? null,
        },
      }, cfg);

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
  ].filter(Boolean).join(" | ");

  const created = await withRetry(() => createShipmentDataEntry({
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
  } as any), cfg);

  await withRetry(() => bestEffortSetTrackingNumber(created.shipmentId, awb), cfg);

  await bestEffortAuditLog({
    eventType: "INTAKE_SHIPMENT_CREATED",
    actorEmail: row.actorEmail ?? null,
    actorRole: row.actorRole ?? null,
    shipmentId: created.shipmentId,
    awb,
    metadata: { wayId: created.wayId, photoUrl, codAmount: Number(row.codAmount || 0) },
  }, cfg);

  return { ok: true, awb, status: "CREATED", shipmentId: created.shipmentId, wayId: created.wayId, photoUrl };
}

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
        results[myIdx] = { ok: false, awb: String(rows[myIdx]?.awb || "—"), status: "FAILED", error: errText(e) };
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}
