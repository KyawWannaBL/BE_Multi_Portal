import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Wand2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DeliveryBackend } from '../api';
import PhotoEvidenceField, { PhotoGuidance } from '../components/PhotoEvidenceField';
import { Field, Panel, PrimaryButton, ScreenShell, SecondaryButton, useBilingual } from '../shared';

function parseText(text: string) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const rows: any[] = [];
  let current: any = {};
  const push = () => {
    if (current.waybill || current.phone || current.receiver || current.address) rows.push(current);
    current = {};
  };
  for (const line of lines) {
    const wb = line.match(/(?:AWB|WAYBILL|WB|TRACK|TT)\s*[:#-]?\s*([A-Z0-9-]{6,})/i);
    if (wb?.[1]) { if (current.waybill) push(); current.waybill = wb[1].toUpperCase(); continue; }
    const phone = line.match(/(\+?95\s?9\d{7,9}|09\d{7,9})/);
    if (phone?.[1]) { current.phone = phone[1].replace(/\s+/g, ''); continue; }
    if (!current.receiver && line.length <= 32 && !/\d/.test(line)) { current.receiver = line; continue; }
    if (!current.address) current.address = line; else current.address += ` ${line}`;
  }
  push();
  return rows;
}

export default function ParcelIntakeScreen() {
  const { t } = useBilingual();
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);

  const extract = async () => {
    if (!photo?.file) return;
    try {
      setBusy(true);
      const res = await DeliveryBackend.extractOcrFromImage(photo.file);
      const backendRows = Array.isArray(res?.rows) ? res.rows : [];
      setRows(backendRows.length ? backendRows.map((r: any) => ({ waybill: r.trackingNo || '', receiver: r.receiverName || '', phone: r.receiverPhone || '', address: r.address || '', note: r.note || '' })) : parseText(String(res?.rawText || '')));
      toast.success(t('OCR extraction complete.', 'OCR extraction ပြီးပါပြီ။'));
    } catch (error: any) {
      toast(error?.message || t('Backend OCR unavailable. Using local parser.', 'Backend OCR မရနိုင်ပါ။ Local parser ကိုသုံးပါမည်။'));
      setRows(parseText(''));
    } finally { setBusy(false); }
  };

  const exportXlsx = () => {
    const sheet = XLSX.utils.aoa_to_sheet([[t('Waybill / AWB','Waybill / AWB'), t('Receiver','လက်ခံသူ'), t('Phone','ဖုန်း'), t('Address','လိပ်စာ'), t('Note','မှတ်ချက်')], ...rows.map((r) => [r.waybill, r.receiver, r.phone, r.address, r.note])]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'INTAKE');
    XLSX.writeFile(wb, `parcel_intake_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <ScreenShell title={t('Parcel intake and OCR table', 'Parcel intake နှင့် OCR table')} subtitle={t('Capture parcel label photos, assess quality, send to OCR, and convert extracted text into editable operational tables.', 'Parcel label ပုံများကိုရိုက်၊ quality စစ်၊ OCR သို့ပို့ပြီး extracted text ကို editable operational table အဖြစ်ပြောင်းပါ။')} actions={<><SecondaryButton onClick={exportXlsx} disabled={!rows.length}><Download size={16} /> {t('Export XLSX', 'XLSX ထုတ်')}</SecondaryButton><PrimaryButton onClick={() => void extract()} disabled={!photo?.file || busy}><Wand2 size={16} /> {busy ? t('Extracting…', 'Extract လုပ်နေသည်…') : t('Run OCR', 'OCR စလုပ်')}</PrimaryButton></>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('Label source image', 'Label source image')}>
            <PhotoEvidenceField title={t('Parcel label / waybill image', 'Parcel label / waybill image')} helperText={t('Good lighting and steady framing will improve OCR and route extraction quality.', 'အလင်းကောင်းပြီး ငြိမ်ငြိမ်ရိုက်ခြင်းက OCR နှင့် route extraction quality ကိုတိုးတက်စေပါသည်။')} onReady={(payload) => setPhoto(payload)} />
          </Panel>
          <PhotoGuidance assessment={photo?.assessment} />
        </div>
        <div className="space-y-6">
          <Panel title={t('Editable intake table', 'Editable intake table')}>
            <div className="overflow-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/30 text-white/45"><tr><th className="p-3">{t('Waybill','Waybill')}</th><th className="p-3">{t('Receiver','လက်ခံသူ')}</th><th className="p-3">{t('Phone','ဖုန်း')}</th><th className="p-3">{t('Address','လိပ်စာ')}</th><th className="p-3">{t('Note','မှတ်ချက်')}</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {rows.length ? rows.map((row, i) => (
                    <tr key={i}>
                      <td className="p-2"><Field label="" value={row.waybill || ''} onChange={(v) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, waybill: v } : r))} /></td>
                      <td className="p-2"><Field label="" value={row.receiver || ''} onChange={(v) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, receiver: v } : r))} /></td>
                      <td className="p-2"><Field label="" value={row.phone || ''} onChange={(v) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, phone: v } : r))} /></td>
                      <td className="p-2"><Field label="" value={row.address || ''} onChange={(v) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, address: v } : r))} /></td>
                      <td className="p-2"><Field label="" value={row.note || ''} onChange={(v) => setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, note: v } : r))} /></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="p-6 text-center text-white/50">{t('No rows yet.', 'Row မရှိသေးပါ။')}</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}
