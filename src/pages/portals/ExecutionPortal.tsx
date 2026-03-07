import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExecutionShell } from "@/components/layout/ExecutionShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, QrCode, RefreshCw, CheckCircle2, XCircle, PackageCheck, ListChecks, Play, Trash2 } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import PhotoCapture from "@/components/PhotoCapture";
import QRCodeScanner from "@/components/QRCodeScanner";
import { parseWayIdFromLabel } from "@/services/shipmentTracking";
import { listAssignedShipments, markPickedUp, markDelivered, markDeliveryFailed, type Shipment } from "@/services/shipments";
import { validateCodOtp } from "@/services/otp";
import { toast } from "@/components/ui/use-toast";

type DeliverMode = "DELIVERED" | "NDR";

type DeliverDraft = {
  shipmentId: string;
  mode: DeliverMode;
  recipientName: string;
  relationship: "Self" | "Family" | "Neighbor" | "Guard" | "Other";
  otp: string;
  note: string;
  signature?: string;
  photo?: string;
};

function badgeFor(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s.includes("DELIVER")) return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (s.includes("FAIL") || s.includes("NDR")) return "border-rose-500/30 text-rose-300 bg-rose-500/10";
  if (s.includes("OUT") || s.includes("PICK")) return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  return "border-white/10 text-white/70 bg-white/5";
}

function normalizeCode(raw: string) {
  const code = (parseWayIdFromLabel(raw) ?? raw ?? "").trim();
  return code.toUpperCase();
}

export default function ExecutionPortal() {
  const { lang } = useLanguage();
  const { user, role } = useAuth();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [scanOpen, setScanOpen] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [draft, setDraft] = useState<DeliverDraft | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Batch queue: shipment IDs in order
  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [batchIndex, setBatchIndex] = useState<number>(0);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  async function refresh() {
    setLoading(true);
    try {
      const r = await listAssignedShipments();
      setRows(r);
    } catch (e: any) {
      toast({ title: "Load failed", description: e?.message || String(e), variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      const st = String(r.status ?? "").toUpperCase();
      if (statusFilter !== "ALL" && st !== statusFilter) return false;
      if (!qq) return true;
      const hay = `${r.trackingNumber ?? ""} ${r.wayId ?? ""} ${r.receiverName ?? ""} ${r.receiverPhone ?? ""} ${r.receiverAddress ?? ""}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [rows, q, statusFilter]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) set.add(String(r.status ?? "UNKNOWN").toUpperCase());
    return ["ALL", ...Array.from(set).sort()];
  }, [rows]);

  function openDeliver(shipmentId: string) {
    setDraft({
      shipmentId,
      mode: "DELIVERED",
      recipientName: "",
      relationship: "Self",
      otp: "",
      note: "",
    });
    setDeliverOpen(true);
  }

  function startBatchProcessing() {
    if (!batchQueue.length) {
      toast({ title: t("Empty queue", "Queue မရှိပါ"), variant: "destructive" as any });
      return;
    }
    setBatchIndex(0);
    setScanOpen(false);
    setSelectedId(batchQueue[0]);
    openDeliver(batchQueue[0]);
  }

  function nextInBatch() {
    const nextIdx = batchIndex + 1;
    if (nextIdx >= batchQueue.length) {
      setBatchIndex(0);
      setBatchQueue([]);
      toast({ title: t("Batch completed", "Batch ပြီးပါပြီ") });
      return;
    }
    setBatchIndex(nextIdx);
    const nextId = batchQueue[nextIdx];
    setSelectedId(nextId);
    openDeliver(nextId);
  }

  async function pickup(shipmentId: string) {
    try {
      await markPickedUp(shipmentId, { at: new Date().toISOString() });
      toast({ title: t("Picked up", "Pickup ပြီးပါပြီ") });
      await refresh();
    } catch (e: any) {
      toast({ title: "Pickup failed", description: e?.message || String(e), variant: "destructive" as any });
    }
  }

  async function submitDeliver() {
    if (!draft) return;

    const shipment = rows.find((r) => r.id === draft.shipmentId);
    const cod = Number(shipment?.codAmount ?? 0);
    const isCod = cod > 0;

    if (!draft.recipientName.trim()) {
      toast({ title: t("Recipient required", "လက်ခံသူအမည်လိုအပ်ပါသည်"), variant: "destructive" as any });
      return;
    }

    // ✅ COD policy: OTP required only if COD > 0
    if (isCod) {
      const otp = draft.otp.trim();
      const otpFormatOk = /^\d{4,8}$/.test(otp);
      if (!otpFormatOk) {
        toast({
          title: t("OTP required for COD", "COD အတွက် OTP လိုအပ်ပါသည်"),
          description: t("Enter 4-8 digits OTP.", "OTP ကို 4-8 လုံးထည့်ပါ။"),
          variant: "destructive" as any,
        });
        return;
      }

      // ✅ Server-side validation (enterprise)
      const v = await validateCodOtp({ shipmentId: draft.shipmentId, otp });
      if (!v.valid) {
        toast({
          title: t("OTP verification failed", "OTP မမှန်ပါ"),
          description: `${t("Mode", "Mode")}: ${v.mode} • ${t("Reason", "Reason")}: ${v.reason ?? "-"}`,
          variant: "destructive" as any,
        });
        return;
      }

      // ✅ COD policy: require signature OR photo evidence
      if (!draft.signature && !draft.photo) {
        toast({
          title: t("Proof required for COD", "COD အတွက် အထောက်အထားလိုအပ်ပါသည်"),
          description: t("Capture signature or photo.", "Signature သို့မဟုတ် Photo တစ်ခုခုယူပါ။"),
          variant: "destructive" as any,
        });
        return;
      }
    }

    const payload = {
      mode: draft.mode,
      recipientName: draft.recipientName,
      relationship: draft.relationship,
      otp: draft.otp || null,
      note: draft.note || null,
      signature: draft.signature || null,
      photo: draft.photo || null,
      codAmount: cod,
      at: new Date().toISOString(),
      actorEmail: user?.email ?? null,
      actorRole: role ?? null,
    };

    try {
      if (draft.mode === "DELIVERED") await markDelivered(draft.shipmentId, payload);
      else await markDeliveryFailed(draft.shipmentId, payload);

      toast({ title: t("Saved", "သိမ်းပြီးပါပြီ") });
      setDeliverOpen(false);
      setDraft(null);
      await refresh();

      // Auto-advance if batch is active
      if (batchQueue.length) nextInBatch();
    } catch (e: any) {
      toast({ title: "Save failed", description: e?.message || String(e), variant: "destructive" as any });
    }
  }

  function findShipmentIdByCode(code: string): string | null {
    const upper = code.toUpperCase();
    const found =
      rows.find((r) => String(r.trackingNumber ?? "").toUpperCase() === upper) ||
      rows.find((r) => String(r.wayId ?? "").toUpperCase() === upper) ||
      rows.find((r) => String(r.id) === upper);

    return found ? found.id : null;
  }

  function handleScanSingle(raw: string) {
    const code = normalizeCode(raw);
    const id = findShipmentIdByCode(code);

    if (!id) {
      toast({ title: t("Not found", "မတွေ့ပါ"), description: `${t("Scanned", "Scan")}: ${code}`, variant: "destructive" as any });
      return;
    }

    setSelectedId(id);
    setQ(code);
    setScanOpen(false);
    toast({ title: t("Found", "တွေ့ပါပြီ"), description: code });
  }

  function handleScanBatch(raw: string) {
    const code = normalizeCode(raw);
    const id = findShipmentIdByCode(code);

    if (!id) {
      toast({ title: t("Not found", "မတွေ့ပါ"), description: `${t("Scanned", "Scan")}: ${code}`, variant: "destructive" as any });
      return;
    }

    setBatchQueue((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });

    setSelectedId(id);
    setQ(code);
    toast({ title: t("Queued", "Queue ထဲထည့်ပြီး"), description: code });
  }

  const batchRows = useMemo(() => batchQueue.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Shipment[], [batchQueue, rows]);

  return (
    <ExecutionShell title={t("Execution Portal", "Execution Portal")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm font-black tracking-widest uppercase">{t("Rider Worklist", "Rider လုပ်ငန်းစာရင်း")}</div>
              <div className="text-xs text-white/60">{user?.email ?? "—"} • {String(role ?? "NO_ROLE")}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={batchQueue.length ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : "border-white/10 text-white/60"}>
                {batchQueue.length ? `${batchQueue.length} ${t("queued", "queued")}` : "queue=0"}
              </Badge>
              <Button variant="outline" className="border-white/10" onClick={() => void refresh()}>
                <RefreshCw className="h-4 w-4 mr-2" /> {t("Refresh", "ပြန်တင်")}
              </Button>
              <Button className="bg-sky-600 hover:bg-sky-500" onClick={() => setScanOpen(true)}>
                <QrCode className="h-4 w-4 mr-2" /> {t("Scan", "Scan")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="h-4 w-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input className="pl-11 bg-[#05080F] border-white/10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search…", "ရှာရန်…")} />
          </div>
          <div className="md:col-span-5">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-[#05080F] border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-[#05080F] border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-6 text-sm text-white/60">{t("Loading…", "ရယူနေပါသည်…")}</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-sm text-white/60">{t("No assigned shipments.", "တာဝန်ပေးထားသော Shipment မရှိပါ။")}</div>
              ) : (
                filtered.map((r) => {
                  const key = r.trackingNumber ?? r.wayId ?? r.id;
                  const cod = Number(r.codAmount ?? 0);
                  return (
                    <div key={r.id} className={`p-4 md:p-5 flex items-start justify-between gap-4 flex-wrap ${selectedId === r.id ? "bg-emerald-500/5" : ""}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-black text-white">{key}</div>
                          <Badge variant="outline" className={badgeFor(r.status)}>{String(r.status ?? "UNKNOWN").toUpperCase()}</Badge>
                          {cod > 0 ? (
                            <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">
                              COD {cod}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-sm text-white/70 mt-1">{r.receiverName ?? "—"} • {r.receiverPhone ?? "—"}</div>
                        <div className="text-xs text-white/50 mt-1 break-words">{r.receiverAddress ?? "—"}</div>
                        <div className="text-[10px] text-white/40 mt-2 font-mono">id={r.id} • updated={r.updatedAt ?? "—"}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-white/10" onClick={() => void pickup(r.id)}>
                          <PackageCheck className="h-4 w-4 mr-2" /> {t("Pickup", "Pickup")}
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => openDeliver(r.id)}>
                          {t("Deliver / NDR", "Deliver / NDR")}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Scan Modal (Single / Batch) */}
        <Dialog open={scanOpen} onOpenChange={(v) => { setScanOpen(v); if (!v) setBatchMode(false); }}>
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">{t("Scan Waybill", "Waybill စကန်ဖတ်ရန်")}</DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={batchMode ? "outline" : "default"}
                  className={batchMode ? "border-white/10" : "bg-sky-600 hover:bg-sky-500"}
                  onClick={() => setBatchMode(false)}
                >
                  {t("Single", "Single")}
                </Button>
                <Button
                  variant={!batchMode ? "outline" : "default"}
                  className={!batchMode ? "border-white/10" : "bg-emerald-600 hover:bg-emerald-500"}
                  onClick={() => setBatchMode(true)}
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  {t("Batch", "Batch")}
                </Button>
              </div>

              {batchMode ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">
                    {batchQueue.length} {t("queued", "queued")}
                  </Badge>
                  <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!batchQueue.length} onClick={startBatchProcessing}>
                    <Play className="h-4 w-4 mr-2" /> {t("Start", "Start")}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10"
                    onClick={() => { setBatchQueue([]); setBatchIndex(0); }}
                    disabled={!batchQueue.length}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> {t("Clear", "ဖျက်")}
                  </Button>
                </div>
              ) : null}
            </div>

            <QRCodeScanner
              continuous={batchMode}
              cooldownMs={1200}
              onScan={(value) => (batchMode ? handleScanBatch(value) : handleScanSingle(value))}
              onError={(e) => toast({ title: "Scan error", description: e, variant: "destructive" as any })}
            />

            {batchMode ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
                  {t("Batch queue", "Batch queue")}
                </div>
                <div className="mt-2 max-h-[160px] overflow-auto space-y-2">
                  {batchRows.length ? (
                    batchRows.map((s) => {
                      const label = s.trackingNumber ?? s.wayId ?? s.id;
                      return (
                        <div key={s.id} className="p-2 rounded-xl bg-black/20 border border-white/10">
                          <div className="text-sm font-semibold text-white">{label}</div>
                          <div className="text-xs text-white/60">{s.receiverName ?? "—"} • {s.receiverPhone ?? "—"}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-white/60">{t("Scan to add shipments.", "Scan လုပ်ပြီး Shipment ထည့်ပါ။")}</div>
                  )}
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" className="border-white/10" onClick={() => setScanOpen(false)}>
                <XCircle className="h-4 w-4 mr-2" /> {t("Close", "ပိတ်")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delivery / NDR Modal */}
        <Dialog
          open={deliverOpen}
          onOpenChange={(v) => {
            setDeliverOpen(v);
            if (!v) setDraft(null);
          }}
        >
          <DialogContent className="bg-[#05080F] border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="font-black tracking-widest uppercase">
                {t("Delivery Proof", "Delivery Proof")}
                {batchQueue.length ? (
                  <span className="ml-3 text-xs font-mono text-amber-300 tracking-widest uppercase">
                    batch {batchIndex + 1}/{batchQueue.length}
                  </span>
                ) : null}
              </DialogTitle>
            </DialogHeader>

            {draft ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Mode", "အမျိုးအစား")}</div>
                    <Select value={draft.mode} onValueChange={(v) => setDraft((x) => (x ? { ...x, mode: v as DeliverMode } : x))}>
                      <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DELIVERED">{t("Delivered", "Delivered")}</SelectItem>
                        <SelectItem value="NDR">{t("Failed (NDR)", "Failed (NDR)")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Relationship", "ဆက်ဆံရေး")}</div>
                    <Select value={draft.relationship} onValueChange={(v) => setDraft((x) => (x ? { ...x, relationship: v as any } : x))}>
                      <SelectTrigger className="bg-[#0B101B] border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Self", "Family", "Neighbor", "Guard", "Other"].map((x) => (<SelectItem key={x} value={x}>{x}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Recipient name", "လက်ခံသူအမည်")}</div>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.recipientName} onChange={(e) => setDraft((x) => (x ? { ...x, recipientName: e.target.value } : x))} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("OTP (COD only)", "OTP (COD only)")}</div>
                    <Input className="bg-[#0B101B] border-white/10" value={draft.otp} onChange={(e) => setDraft((x) => (x ? { ...x, otp: e.target.value } : x))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Note", "မှတ်ချက်")}</div>
                  <Input className="bg-[#0B101B] border-white/10" value={draft.note} onChange={(e) => setDraft((x) => (x ? { ...x, note: e.target.value } : x))} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase mb-2">{t("Signature", "Signature")}</div>
                    <SignaturePad onSave={(sig) => setDraft((x) => (x ? { ...x, signature: sig } : x))} />
                  </div>

                  <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs font-mono text-white/60 tracking-widest uppercase mb-2">{t("Photo", "Photo")}</div>
                    <PhotoCapture
                      onCapture={(p) => setDraft((x) => (x ? { ...x, photo: p } : x))}
                      watermarkData={{
                        ttId: draft.shipmentId,
                        userId: user?.id ?? "unknown",
                        timestamp: new Date().toISOString(),
                        gps: "auto",
                      }}
                      required={false}
                    />
                  </div>
                </div>

                <div className="text-xs text-white/50">
                  {t(
                    "COD policy: OTP required + (signature OR photo). OTP can be server-validated.",
                    "COD policy: OTP လို + (signature သို့မဟုတ် photo) လို။ OTP ကို server က verify လုပ်နိုင်သည်။"
                  )}
                </div>
              </div>
            ) : null}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                className="border-white/10"
                onClick={() => {
                  setDeliverOpen(false);
                  setDraft(null);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" /> {t("Cancel", "မလုပ်တော့")}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => void submitDeliver()}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> {t("Confirm", "အတည်ပြု")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExecutionShell>
  );
}
