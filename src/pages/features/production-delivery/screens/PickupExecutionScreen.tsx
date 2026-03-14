import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, UploadCloud } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { canAccess, DELIVERY_PERMISSIONS } from '../permissions';
import PhotoEvidenceField, { PhotoGuidance } from '../components/PhotoEvidenceField';
import SignaturePad from '../components/SignaturePad';
import DeviceQrScanner from '../components/DeviceQrScanner';
import { Field, Panel, PrimaryButton, ScreenShell, TextAreaField, useBilingual } from '../shared';

export default function PickupExecutionScreen({ auth }: { auth?: any }) {
  const { t } = useBilingual();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({ deliveryId: '', trackingNo: '', tamperTag: '', pickupBagCode: '', merchantName: '', riderName: '', expectedPieces: '1', actualPieces: '1', warehouseDestination: 'Yangon Main Hub', note: '' });
  const [sealIntact, setSealIntact] = useState(true);
  const [photo, setPhoto] = useState<any>(null);
  const [signature, setSignature] = useState<{ dataUrl: string | null; isSigned: boolean }>({ dataUrl: null, isSigned: false });

  if (!canAccess(auth, DELIVERY_PERMISSIONS.PICKUP_EXECUTE)) {
    return <DeniedCard label={t('pickup execution', 'pickup execution')} />;
  }

  const submit = async () => {
    try {
      setBusy(true);
      let evidenceId: string | undefined;
      if (photo?.file && canAccess(auth, DELIVERY_PERMISSIONS.MEDIA_UPLOAD)) {
        const upload = await DeliveryBackend.uploadEvidence(photo.file, { deliveryId: data.deliveryId, trackingNo: data.trackingNo, evidenceType: 'PICKUP_PHOTO', qualityScore: photo.assessment?.score || 0 });
        evidenceId = upload?.id;
      }
      await DeliveryBackend.pickupSecure({ ...data, expectedPieces: Number(data.expectedPieces || 0), actualPieces: Number(data.actualPieces || 0), sealIntact, evidenceIds: evidenceId ? [evidenceId] : [], signatureDataUrl: signature.dataUrl, gpsRequested: true });
      toast.success(t('Pickup secured successfully.', 'Pickup ကိုအောင်မြင်စွာအတည်ပြုပြီးပါပြီ။'));
    } catch (error: any) {
      toast.error(error?.message || t('Pickup secure failed.', 'Pickup secure မအောင်မြင်ပါ။'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell title={t('Pickup execution', 'Pickup ဆောင်ရွက်မှု')} subtitle={t('Secure merchant handover with QR scan, tamper tag, parcel photo, signature, and backend event creation.', 'Merchant လွှဲပြောင်းမှုကို QR scan, tamper tag, parcel photo, signature နှင့် backend event ဖြင့်လုံခြုံစွာမှတ်တမ်းတင်ပါ။')} actions={<PrimaryButton onClick={() => void submit()} disabled={busy || !data.trackingNo || !data.tamperTag || !signature.isSigned}><ShieldCheck size={16} /> {busy ? t('Securing…', 'အတည်ပြုနေသည်…') : t('Secure pickup', 'Pickup အတည်ပြု')}</PrimaryButton>}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title={t('Scan and parcel identity', 'စကင်နှင့် ပါဆယ်အတည်ပြုမှု')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Delivery id', 'Delivery id')} value={data.deliveryId} onChange={(value) => setData((p) => ({ ...p, deliveryId: value }))} />
              <Field label={t('Merchant name', 'Merchant အမည်')} value={data.merchantName} onChange={(value) => setData((p) => ({ ...p, merchantName: value }))} />
            </div>
            <div className="mt-4"><DeviceQrScanner value={data.trackingNo} onChange={(value) => setData((p) => ({ ...p, trackingNo: value }))} title={t('Track / QR scan', 'Track / QR scan')} helperText={t('Use the parcel QR, AWB barcode, or tracking label.', 'Parcel QR၊ AWB barcode သို့မဟုတ် tracking label ကိုသုံးပါ။')} /></div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t('Tamper tag', 'Tamper tag')} value={data.tamperTag} onChange={(value) => setData((p) => ({ ...p, tamperTag: value }))} />
              <Field label={t('Pickup bag / route bag', 'Pickup bag / route bag')} value={data.pickupBagCode} onChange={(value) => setData((p) => ({ ...p, pickupBagCode: value }))} />
            </div>
          </Panel>

          <Panel title={t('Piece validation', 'အရေအတွက်စစ်ဆေးခြင်း')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Expected pieces', 'မျှော်မှန်းအရေအတွက်')} type="number" value={data.expectedPieces} onChange={(value) => setData((p) => ({ ...p, expectedPieces: value }))} />
              <Field label={t('Actual pieces', 'တကယ်လက်ခံအရေအတွက်')} type="number" value={data.actualPieces} onChange={(value) => setData((p) => ({ ...p, actualPieces: value }))} />
              <Field label={t('Rider / field staff', 'Rider / field staff')} value={data.riderName} onChange={(value) => setData((p) => ({ ...p, riderName: value }))} />
              <Field label={t('Warehouse destination', 'Warehouse destination')} value={data.warehouseDestination} onChange={(value) => setData((p) => ({ ...p, warehouseDestination: value }))} />
            </div>
            <label className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><input type="checkbox" checked={sealIntact} onChange={(e) => setSealIntact(e.target.checked)} /> {t('Seal / packaging appears intact', 'Seal / packaging အကောင်းအတိုင်းရှိ')}</label>
            <div className="mt-4"><TextAreaField label={t('Pickup note', 'Pickup မှတ်ချက်')} value={data.note} onChange={(value) => setData((p) => ({ ...p, note: value }))} rows={4} /></div>
          </Panel>

          <Panel title={t('Photo evidence and signature', 'ဓာတ်ပုံနှင့် လက်မှတ်')}>
            <div className="grid gap-4 xl:grid-cols-2">
              <PhotoEvidenceField title={t('Pickup parcel photo', 'Pickup parcel photo')} helperText={t('The system scores blur, glare, brightness, and readiness for OCR review.', 'စနစ်က blur, glare, brightness နှင့် OCR readiness ကိုစစ်ဆေးပါသည်။')} onReady={(payload) => setPhoto(payload)} />
              <SignaturePad onChange={setSignature} />
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <PhotoGuidance assessment={photo?.assessment} />
          <Panel title={t('Pickup gate checks', 'Pickup gate checks')}>
            <GateRow label={t('Tracking code captured', 'Tracking code ရရှိ')} ok={Boolean(data.trackingNo)} />
            <GateRow label={t('Tamper tag assigned', 'Tamper tag သတ်မှတ်ပြီး')} ok={Boolean(data.tamperTag)} />
            <GateRow label={t('Expected and actual pieces match', 'မျှော်မှန်းနှင့် တကယ်လက်ခံ အရေအတွက်တူ')} ok={Number(data.expectedPieces || 0) === Number(data.actualPieces || 0)} />
            <GateRow label={t('Photo quality is usable', 'ဓာတ်ပုံ quality သုံးလို့ရ')} ok={(photo?.assessment?.score || 0) >= 60} />
            <GateRow label={t('Signature captured', 'လက်မှတ်ရရှိ')} ok={signature.isSigned} />
          </Panel>
          <Panel title={t('Backend upload flow', 'Backend upload flow')}>
            <div className="flex items-start gap-3 text-sm text-white/70"><UploadCloud size={18} className="mt-0.5 text-emerald-300" /> {t('When you confirm pickup, the photo is uploaded first, then the pickup workflow event is committed with the evidence id and signature payload.', 'Pickup အတည်ပြုသောအခါ photo ကိုဦးစွာ upload လုပ်ပြီး၊ ထို့နောက် evidence id နှင့် signature payload ဖြင့် pickup workflow event ကို commit လုပ်ပါသည်။')}</div>
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}

function GateRow({ label, ok }: { label: string; ok: boolean }) { return <div className={`rounded-2xl border px-4 py-3 text-sm ${ok ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/60'}`}>{label}</div>; }
function DeniedCard({ label }: { label: string }) { return <div className="min-h-screen bg-[#08101B] p-8 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6"><div className="text-lg font-black">Permission required</div><div className="mt-2 text-sm text-rose-200">You do not have access to {label}.</div></div></div>; }
