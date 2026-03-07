#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Parcel Intake Upload Enhancement
# ✅ Deduplicate by AWB before creating shipments
# ✅ Concurrent bulk upload (default 5 workers)
#
# Optional env (frontend):
#   VITE_INTAKE_UPLOAD_CONCURRENCY=5
#
# Files patched:
# - src/services/intakeUploader.ts
# - src/pages/portals/ExecutionParcelIntakePage.tsx
# ==============================================================================

backup(){ [[ -f "$1" ]] && cp -f "$1" "$1.bak.$(date +%Y%m%d_%H%M%S)" || true; }

UPLOADER="src/services/intakeUploader.ts"
INTAKE="src/pages/portals/ExecutionParcelIntakePage.tsx"

mkdir -p "$(dirname "$UPLOADER")" "$(dirname "$INTAKE")"
backup "$UPLOADER"
backup "$INTAKE"

# ------------------------------------------------------------------------------
# 1) intakeUploader.ts (dedupe + concurrency + best-effort tracking_number update)
# ------------------------------------------------------------------------------
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

type ExistingShipment = { id: string; way_id?: string | null; tracking_number?: string | null };

async function findExistingShipmentByAwb(awb: string): Promise<ExistingShipment | null> {
  if (!isSupabaseConfigured) return null;

  const cols = ["tracking_number", "way_id", "awb", "awb_no", "airway_bill", "airwaybill", "tt_id"];
  for (const col of cols) {
    try {
      const res = await supabase
        .from("shipments")
        .select("id,way_id,tracking_number")
        .eq(col as any, awb)
        .order("updated_at" as any, { ascending: false })
        .limit(1);

      if (!res.error && Array.isArray(res.data) && res.data.length) {
        return res.data[0] as any;
      }
    } catch {
      // try next col
    }
  }
  return null;
}

async function bestEffortSetTrackingNumber(shipmentId: string, awb: string) {
  if (!isSupabaseConfigured) return;
  try {
    // Some schemas use tracking_number; if missing it will fail harmlessly.
    await supabase.from("shipments").update({ tracking_number: awb } as any).eq("id", shipmentId);
  } catch {
    // ignore
  }
}

async function processOne(row: UploadRowInput, defaults: IntakeUploadDefaults, dedupe: boolean): Promise<UploadRowResult> {
  const awb = String(row.awb || "").trim();
  if (!awb || awb === "—") return { ok: false, awb: awb || "—", status: "FAILED", error: "AWB_REQUIRED" };

  // Optional: photo upload even if we skip create (keeps evidence)
  const photoUrl = row.labelPhotoDataUrl ? await uploadLabelPhotoBestEffort(awb, row.labelPhotoDataUrl) : null;

  if (dedupe) {
    const existing = await findExistingShipmentByAwb(awb);
    if (existing?.id) {
      return {
        ok: true,
        awb,
        status: "SKIPPED_EXISTS",
        shipmentId: String(existing.id),
        wayId: existing.way_id ?? null,
        trackingNumber: existing.tracking_number ?? null,
        photoUrl,
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

  const created = await createShipmentDataEntry({
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
  } as any);

  await bestEffortSetTrackingNumber(created.shipmentId, awb);

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
 * EN: Bulk upload with dedupe + concurrency worker pool.
 * MM: Dedup + concurrency (worker pool) နဲ့ bulk upload
 */
export async function uploadParcelsFromIntake(
  rows: UploadRowInput[],
  defaults: IntakeUploadDefaults,
  options?: UploadOptions
): Promise<UploadRowResult[]> {
  const dedupe = options?.dedupe ?? true;
  const concurrency = clamp(Number(options?.concurrency ?? 5), 1, 10);

  const results: UploadRowResult[] = new Array(rows.length);
  let idx = 0;

  const worker = async () => {
    while (true) {
      const myIdx = idx;
      idx += 1;
      if (myIdx >= rows.length) return;

      try {
        results[myIdx] = await processOne(rows[myIdx], defaults, dedupe);
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

# ------------------------------------------------------------------------------
# 2) Patch Intake page: show SKIPPED + concurrency option + dedupe always ON
# ------------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/pages/portals/ExecutionParcelIntakePage.tsx")
if not p.exists():
    print("[warn] Intake page not found:", p)
    raise SystemExit(0)

s = p.read_text(encoding="utf-8", errors="ignore")

# Ensure we import UploadOptions usage: we call uploadParcelsFromIntake with concurrency
# We'll patch uploadToSystem() function block to pass concurrency & handle SKIPPED_EXISTS.

# 1) Add concurrency read helper near top if not present
if "VITE_INTAKE_UPLOAD_CONCURRENCY" not in s:
    s = s.replace(
        "export default function ExecutionParcelIntakePage() {",
        """function envInt(key: string, fallback: number) {
  const v = (import.meta as any)?.env?.[key];
  const n = Number(v ?? fallback);
  return Number.isFinite(n) ? n : fallback;
}

export default function ExecutionParcelIntakePage() {"""
    )

# 2) Replace uploadToSystem() to include concurrency + handle SKIPPED_EXISTS
pattern = re.compile(r"async function uploadToSystem\(\) \{[\s\S]*?\n  \}", re.M)
if pattern.search(s):
    replacement = r'''async function uploadToSystem() {
    if (!delivery.length) return;

    const concurrency = envInt("VITE_INTAKE_UPLOAD_CONCURRENCY", 5);

    setDelivery((p) => p.map((r) => ({ ...r, uploadStatus: "UPLOADING", error: "" })));

    const results = await uploadParcelsFromIntake(
      delivery.map((r) => ({
        awb: r.awb,
        receiver: r.receiver,
        phone: r.phone,
        address: r.address,
        codAmount: r.codAmount,
        labelPhotoDataUrl: r.labelPhotoDataUrl ?? null,
      })),
      defaults,
      { dedupe: true, concurrency }
    );

    setDelivery((prev) =>
      prev.map((r) => {
        const rr: any = results.find((x: any) => x.awb === r.awb);
        if (!rr) return r;

        if (rr.ok && rr.status === "CREATED") {
          return { ...r, uploadStatus: "UPLOADED", shipmentId: rr.shipmentId, wayId: rr.wayId, error: "" };
        }

        if (rr.ok && rr.status === "SKIPPED_EXISTS") {
          return {
            ...r,
            uploadStatus: "SKIPPED",
            shipmentId: rr.shipmentId,
            wayId: rr.wayId ?? "",
            error: "ALREADY_EXISTS",
          };
        }

        return { ...r, uploadStatus: "FAILED", error: rr.error ?? "FAILED" };
      })
    );
  }'''
    s = pattern.sub(replacement, s, count=1)
else:
    print("[warn] uploadToSystem() block not found; please patch manually.")

# 3) Add uploadStatus type "SKIPPED" into page if present in union (best-effort)
s = s.replace('"UPLOADED" | "FAILED";', '"UPLOADED" | "FAILED" | "SKIPPED";')

# 4) Ensure table rendering handles SKIPPED
# Replace the upload cell block if it matches previous patterns
s = s.replace(
    'r.uploadStatus === "UPLOADED" ?',
    'r.uploadStatus === "UPLOADED" ?'
)

# If SKIPPED not mentioned, insert a branch
if "SKIPPED" not in s:
    # Try inject into the upload status render section by locating FAILED branch
    s = s.replace(
        ' ) : r.uploadStatus === "FAILED" ? (',
        ' ) : r.uploadStatus === "SKIPPED" ? (\n'
        '                            <div className="text-amber-300 text-xs">\n'
        '                              <div className="flex items-center gap-2"><XCircle className="h-4 w-4" /> SKIPPED</div>\n'
        '                              <div className="text-[10px] opacity-80">ALREADY_EXISTS</div>\n'
        '                            </div>\n'
        '                          ) : r.uploadStatus === "FAILED" ? ('
    )

p.write_text(s, encoding="utf-8")
print("[ok] Intake page patched: concurrency + SKIPPED_EXISTS UI")
PY

git add "$UPLOADER" "$INTAKE" 2>/dev/null || true

echo "✅ Applied:"
echo " - Dedup by AWB (tracking_number/way_id/awb columns) before creating"
echo " - Bulk concurrent upload (default 5, env configurable)"
echo " - UI shows SKIPPED if already exists"
echo
echo "Optional env:"
echo "  VITE_INTAKE_UPLOAD_CONCURRENCY=5"
echo
echo "Commit:"
echo "  git commit -m \"feat(intake): dedupe by awb + concurrent bulk upload\""