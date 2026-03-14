import React, { useMemo, useState } from "react";
import { ExecutionShell } from "@/components/layout/ExecutionShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhotoCapture from "@/components/PhotoCapture";
import { Download, FileImage, Wand2, XCircle, Plus } from "lucide-react";
import * as XLSX from "xlsx";

type Row = {
  waybill: string;
  receiver: string;
  phone: string;
  address: string;
  note: string;
};

function parseTextToRows(text: string): Row[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: Row[] = [];
  let current: Partial<Row> = {};

  const push = () => {
    const r: Row = {
      waybill: (current.waybill ?? "").trim(),
      receiver: (current.receiver ?? "").trim(),
      phone: (current.phone ?? "").trim(),
      address: (current.address ?? "").trim(),
      note: (current.note ?? "").trim(),
    };
    if (r.waybill || r.phone || r.receiver || r.address) rows.push(r);
    current = {};
  };

  for (const l of lines) {
    const wb = l.match(/(?:AWB|WAYBILL|WB|TT)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
    if (wb?.[1]) {
      if (current.waybill) push();
      current.waybill = wb[1].toUpperCase();
      continue;
    }

    const phone = l.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
    if (phone?.[1]) {
      current.phone = phone[1].replace(/\s+/g, "");
      continue;
    }

    // crude name heuristic
    if (!current.receiver && l.length <= 32 && !/\d/.test(l)) {
      current.receiver = l;
      continue;
    }

    // address fallback
    if (!current.address) current.address = l;
    else current.address += " " + l;
  }

  push();
  return rows.slice(0, 300);
}

export default function ExecutionOcrExportPage() {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const [img, setImg] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const headers = useMemo(
    () => [
      t("Waybill / AWB", "Waybill / AWB"),
      t("Receiver", "လက်ခံသူ"),
      t("Phone", "ဖုန်း"),
      t("Address", "လိပ်စာ"),
      t("Note", "မှတ်ချက်"),
    ],
    [lang]
  );

  async function runOcr() {
    if (!img) return;
    setBusy(true);
    try {
      const mod = await import("tesseract.js");
      const res = await mod.recognize(img, "eng", {
        logger: () => {},
      } as any);

      const out = String(res?.data?.text ?? "");
      setText(out);
      setRows(parseTextToRows(out));
    } finally {
      setBusy(false);
    }
  }

  function exportXlsx() {
    const sheet = XLSX.utils.aoa_to_sheet([
      headers,
      ...rows.map((r) => [r.waybill, r.receiver, r.phone, r.address, r.note]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "OCR");

    const file = `ocr_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, file);
  }

  function setCell(i: number, k: keyof Row, v: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  }

  return (
    <ExecutionShell title={t("OCR → Excel", "OCR → Excel")}>
      <div className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-black tracking-widest uppercase">{t("Text extraction from images", "ပုံမှ စာသားထုတ်ယူရန်")}</div>
            <div className="text-xs text-white/60">
              {t("Capture/upload → OCR → parse → export XLSX.", "Capture/upload → OCR → parse → XLSX ထုတ်ရန်")}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 space-y-3">
            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Capture", "Capture")}</div>
                <PhotoCapture
                  onCapture={(p) => setImg(p)}
                  watermarkData={{
                    ttId: "OCR",
                    userId: "exec",
                    timestamp: new Date().toISOString(),
                    gps: "auto",
                  }}
                  required={false}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Upload", "Upload")}</div>
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                    <FileImage className="h-4 w-4" />
                    {t("Choose image", "ပုံရွေး")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () => setImg(String(r.result));
                        r.readAsDataURL(f);
                      }}
                    />
                  </label>
                </div>

                {img ? (
                  <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <img src={img} alt="ocr" className="w-full max-h-[320px] object-contain bg-black" />
                  </div>
                ) : (
                  <div className="text-sm text-white/60">{t("No image selected.", "ပုံမရွေးထားပါ။")}</div>
                )}

                <div className="flex gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-500" disabled={!img || busy} onClick={() => void runOcr()}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {busy ? t("Processing…", "လုပ်နေသည်…") : t("Run OCR", "OCR စလုပ်")}
                  </Button>
                  <Button variant="outline" className="border-white/10" onClick={() => { setImg(null); setText(""); setRows([]); }}>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("Clear", "ဖျက်")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-mono text-white/60 tracking-widest uppercase">
                    {t("Parsed table", "Table")}
                    <span className="ml-2 text-white/40">({rows.length})</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10" onClick={() => setRows((r) => [{ waybill:"", receiver:"", phone:"", address:"", note:"" }, ...r])}>
                      <Plus className="h-4 w-4 mr-2" /> {t("Add", "ထည့်")}
                    </Button>
                    <Button className="bg-sky-600 hover:bg-sky-500" disabled={!rows.length} onClick={exportXlsx}>
                      <Download className="h-4 w-4 mr-2" /> {t("Export XLSX", "XLSX ထုတ်")}
                    </Button>
                  </div>
                </div>

                <div className="overflow-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/70">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="p-3 text-xs font-mono tracking-widest uppercase">{h}</th>
                        ))}
                        <th className="p-3 text-xs font-mono tracking-widest uppercase">{t("Actions", "လုပ်ဆောင်")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.waybill} onChange={(e) => setCell(i, "waybill", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.receiver} onChange={(e) => setCell(i, "receiver", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.phone} onChange={(e) => setCell(i, "phone", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.address} onChange={(e) => setCell(i, "address", e.target.value)} /></td>
                          <td className="p-2"><Input className="bg-black/30 border-white/10" value={r.note} onChange={(e) => setCell(i, "note", e.target.value)} /></td>
                          <td className="p-2">
                            <Button variant="outline" className="border-white/10" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}>
                              {t("Remove", "ဖျက်")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!rows.length ? (
                        <tr><td colSpan={6} className="p-6 text-white/60">{t("No rows.", "Row မရှိပါ။")}</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-white/40">
                  {t("Tip: OCR quality improves with clear photos and good lighting.", "အကြံပြုချက်: ပုံကြည်လင်ပြီး အလင်းကောင်းမှ OCR ပိုကောင်းမည်။")}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#05080F] border-white/10">
              <CardContent className="p-4">
                <div className="text-xs font-mono text-white/60 tracking-widest uppercase">{t("Raw OCR text", "OCR text")}</div>
                <pre className="mt-2 text-xs text-white/60 whitespace-pre-wrap break-words">{text || "—"}</pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ExecutionShell>
  );
}
