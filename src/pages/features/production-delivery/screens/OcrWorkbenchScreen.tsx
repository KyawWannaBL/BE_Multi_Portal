import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Wand2 } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { canAccess, DELIVERY_PERMISSIONS } from '../permissions';
import PhotoEvidenceField, { PhotoGuidance } from '../components/PhotoEvidenceField';
import { Panel, PrimaryButton, ScreenShell, TextAreaField, useBilingual } from '../shared';

function parseRawText(rawText: string) {
  return rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => ({ trackingNo: '', senderName: '', receiverName: line, receiverPhone: '', address: '', note: `row-${index + 1}` }));
}

export default function OcrWorkbenchScreen({ auth }: { auth?: any }) {
  const { t } = useBilingual();
  const [busy, setBusy] = useState(false);
  const [rawText, setRawText] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [photo, setPhoto] = useState<any>(null);

  if (!canAccess(auth, DELIVERY_PERMISSIONS.OCR_USE)) {
    return <DeniedCard label={t('OCR workbench', 'OCR workbench')} />;
  }

  const normalize = async () => {
    try {
      setBusy(true);
      const res = await DeliveryBackend.normalizeOcrText(rawText);
      setRows(Array.isArray(res?.rows) ? res.rows : []);
      toast.success(t('OCR text normalized.', 'OCR text ကို normalize လုပ်ပြီးပါပြီ။'));
    } catch (error: any) {
      toast(error?.message || t('Backend normalizer unavailable. Using local fallback.', 'Backend normalizer မရနိုင်ပါ။ Local fallback ကိုသုံးပါမည်။'));
      setRows(parseRawText(rawText));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell title={t('OCR workbench', 'OCR workbench')} subtitle={t('Normalize raw OCR text into structured operational fields that can feed create-delivery, warehouse QC, and exception handling.', 'Raw OCR text ကို create-delivery၊ warehouse QC နှင့် exception handling တွင်သုံးနိုင်သော structured data အဖြစ်ပြောင်းပါ။')} actions={<PrimaryButton onClick={() => void normalize()} disabled={!rawText.trim() || busy}><Wand2 size={16} /> {busy ? t('Normalizing…', 'Normalizing လုပ်နေသည်…') : t('Normalize OCR text', 'OCR text normalize')}</PrimaryButton>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('OCR source text', 'OCR source text')}>
            <TextAreaField label={t('Raw OCR text', 'Raw OCR text')} value={rawText} onChange={setRawText} rows={14} />
          </Panel>
          <Panel title={t('Source image guidance', 'Source image guidance')}>
            <PhotoEvidenceField title={t('OCR source image', 'OCR source image')} helperText={t('Use this when support or warehouse teams need to understand why OCR confidence is low.', 'Support သို့မဟုတ် warehouse team များအနေဖြင့် OCR confidence နိမ့်ရခြင်းကိုနားလည်ရန် အသုံးပြုပါ။')} onReady={(payload) => setPhoto(payload)} />
          </Panel>
          <PhotoGuidance assessment={photo?.assessment} />
        </div>
        <div className="space-y-6">
          <Panel title={t('Structured rows', 'Structured rows')}>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/30 text-white/45"><tr><th className="p-3">{t('Tracking','Tracking')}</th><th className="p-3">{t('Receiver','လက်ခံသူ')}</th><th className="p-3">{t('Phone','ဖုန်း')}</th><th className="p-3">{t('Address','လိပ်စာ')}</th><th className="p-3">{t('Note','မှတ်ချက်')}</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {rows.length ? rows.map((row, i) => <tr key={i}><td className="p-3">{row.trackingNo || '-'}</td><td className="p-3">{row.receiverName || '-'}</td><td className="p-3">{row.receiverPhone || '-'}</td><td className="p-3">{row.address || '-'}</td><td className="p-3">{row.note || '-'}</td></tr>) : <tr><td colSpan={5} className="p-6 text-center text-white/50">{t('No rows yet.', 'Row မရှိသေးပါ။')}</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}

function DeniedCard({ label }: { label: string }) { return <div className="min-h-screen bg-[#08101B] p-8 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6"><div className="text-lg font-black">Permission required</div><div className="mt-2 text-sm text-rose-200">You do not have access to {label}.</div></div></div>; }
