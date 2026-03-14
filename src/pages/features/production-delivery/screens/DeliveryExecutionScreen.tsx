import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { canAccess, DELIVERY_PERMISSIONS } from '../permissions';
import DeviceQrScanner from '../components/DeviceQrScanner';
import PhotoEvidenceField, { PhotoGuidance } from '../components/PhotoEvidenceField';
import SignaturePad from '../components/SignaturePad';
import { Field, Panel, PrimaryButton, ScreenShell, SecondaryButton, SelectField, TextAreaField, useBilingual } from '../shared';

type Mode = 'DELIVERED' | 'FAILED';

export default function DeliveryExecutionScreen({ auth }: { auth?: any }) {
  const { t } = useBilingual();
  const [mode, setMode] = useState<Mode>('DELIVERED');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ deliveryId: '', trackingNo: '', deliveredTo: '', receiverRole: 'CUSTOMER', codCollected: '0', failureReason: 'Customer Unavailable', note: '' });
  const [photo, setPhoto] = useState<any>(null);
  const [signature, setSignature] = useState<{ dataUrl: string | null; isSigned: boolean }>({ dataUrl: null, isSigned: false });

  if (!canAccess(auth, [DELIVERY_PERMISSIONS.DELIVERY_PROOF, DELIVERY_PERMISSIONS.DELIVERY_FAIL])) {
    return <DeniedCard label={t('delivery execution', 'delivery execution')} />;
  }

  const submitDelivered = async () => {
    try {
      setBusy(true);
      let evidenceId: string | undefined;
      if (photo?.file) {
        const upload = await DeliveryBackend.uploadEvidence(photo.file, { deliveryId: form.deliveryId, trackingNo: form.trackingNo, evidenceType: 'DELIVERY_PHOTO', qualityScore: photo.assessment?.score || 0 });
        evidenceId = upload?.id;
      }
      await DeliveryBackend.proofOfDelivery({ deliveryId: form.deliveryId, trackingNo: form.trackingNo, deliveredTo: form.deliveredTo, receiverRole: form.receiverRole, codCollected: Number(form.codCollected || 0), note: form.note, signatureDataUrl: signature.dataUrl, evidenceIds: evidenceId ? [evidenceId] : [], gpsRequested: true });
      toast.success(t('Proof of delivery recorded.', 'Proof of delivery ကိုမှတ်တမ်းတင်ပြီးပါပြီ။'));
    } catch (error: any) {
      toast.error(error?.message || t('Failed to save proof of delivery.', 'Proof of delivery ကိုမသိမ်းနိုင်ပါ။'));
    } finally {
      setBusy(false);
    }
  };

  const submitFailed = async () => {
    try {
      setBusy(true);
      let evidenceId: string | undefined;
      if (photo?.file) {
        const upload = await DeliveryBackend.uploadEvidence(photo.file, { deliveryId: form.deliveryId, trackingNo: form.trackingNo, evidenceType: 'DELIVERY_PHOTO', qualityScore: photo.assessment?.score || 0 });
        evidenceId = upload?.id;
      }
      await DeliveryBackend.markFailure({ deliveryId: form.deliveryId, trackingNo: form.trackingNo, reason: form.failureReason, note: form.note, evidenceIds: evidenceId ? [evidenceId] : [], gpsRequested: true });
      toast.success(t('Failed attempt recorded.', 'ပို့ဆောင်မှုမအောင်မြင်မှုကိုမှတ်တမ်းတင်ပြီးပါပြီ။'));
    } catch (error: any) {
      toast.error(error?.message || t('Failed to record delivery exception.', 'Delivery exception ကိုမမှတ်တမ်းတင်နိုင်ပါ။'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell title={t('Delivery proof and exception handling', 'Delivery proof နှင့် exception handling')} subtitle={t('Capture successful delivery proof or structured failure reasons with photo evidence, signature, GPS, and customer-facing audit detail.', 'အောင်မြင်သော delivery proof သို့မဟုတ် failure reason များကို photo evidence, signature, GPS နှင့် audit detail ဖြင့် မှတ်တမ်းတင်ပါ။')} actions={<><SecondaryButton onClick={() => setMode('FAILED')}><XCircle size={16} /> {t('Failed attempt mode', 'Failed attempt mode')}</SecondaryButton><PrimaryButton onClick={() => setMode('DELIVERED')}><CheckCircle2 size={16} /> {t('Delivered mode', 'Delivered mode')}</PrimaryButton></>}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title={t('Tracking and delivery target', 'Tracking နှင့် delivery target')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Delivery id', 'Delivery id')} value={form.deliveryId} onChange={(value) => setForm((p) => ({ ...p, deliveryId: value }))} />
              <Field label={t('Delivered to', 'ဘယ်သူလက်ခံ')} value={form.deliveredTo} onChange={(value) => setForm((p) => ({ ...p, deliveredTo: value }))} disabled={mode === 'FAILED'} />
            </div>
            <div className="mt-4"><DeviceQrScanner value={form.trackingNo} onChange={(value) => setForm((p) => ({ ...p, trackingNo: value }))} title={t('Delivered parcel scan', 'Delivered parcel scan')} helperText={t('Confirm that the parcel at hand matches the order before completing the last-mile event.', 'နောက်ဆုံးအဆင့် event မတင်မီ လက်ထဲရှိပါဆယ်နှင့် order ကိုကိုက်ညီကြောင်းအတည်ပြုပါ။')} /></div>
          </Panel>

          {mode === 'DELIVERED' ? (
            <Panel title={t('Proof of delivery', 'Proof of delivery')}>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label={t('Receiver role', 'လက်ခံသူအမျိုးအစား')} value={form.receiverRole} onChange={(value) => setForm((p) => ({ ...p, receiverRole: value }))} options={[{ value: 'CUSTOMER', label: t('Customer', 'ဖောက်သည်') }, { value: 'FAMILY', label: t('Family / colleague', 'မိသားစု / လုပ်ဖော်ကိုင်ဖက်') }, { value: 'SECURITY', label: t('Security / concierge', 'လုံခြုံရေး / concierge') }]} />
                <Field label={t('COD collected', 'COD ရရှိပမာဏ')} type="number" value={form.codCollected} onChange={(value) => setForm((p) => ({ ...p, codCollected: value }))} />
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <PhotoEvidenceField title={t('Delivery handover photo', 'Delivery handover photo')} helperText={t('Capture the parcel, receiver handover context, and readable label if possible.', 'ပါဆယ်၊ လက်ခံသူလွှဲပြောင်းမှုနှင့် label ကိုတတ်နိုင်သမျှရိုက်ပါ။')} onReady={(payload) => setPhoto(payload)} />
                <SignaturePad onChange={setSignature} />
              </div>
              <div className="mt-4"><TextAreaField label={t('Delivery note', 'Delivery note')} value={form.note} onChange={(value) => setForm((p) => ({ ...p, note: value }))} rows={4} /></div>
              <div className="mt-4"><PrimaryButton onClick={() => void submitDelivered()} disabled={busy || !form.trackingNo || !form.deliveredTo || !signature.isSigned}><CheckCircle2 size={16} /> {busy ? t('Saving…', 'သိမ်းနေသည်…') : t('Confirm delivery', 'Delivery အတည်ပြု')}</PrimaryButton></div>
            </Panel>
          ) : (
            <Panel title={t('Non-delivery report', 'Non-delivery report')}>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label={t('Failure reason', 'မအောင်မြင်ရသည့်အကြောင်းရင်း')} value={form.failureReason} onChange={(value) => setForm((p) => ({ ...p, failureReason: value }))} options={[
                  { value: 'Customer Unavailable', label: t('Customer unavailable', 'ဖောက်သည်မရှိ') },
                  { value: 'Wrong Address', label: t('Wrong address', 'လိပ်စာမှား') },
                  { value: 'Refused to Accept', label: t('Refused to accept', 'လက်မခံ') },
                  { value: 'Phone Unreachable', label: t('Phone unreachable', 'ဖုန်းမရ') },
                  { value: 'Unsafe Location', label: t('Unsafe location', 'နေရာမလုံခြုံ') },
                ]} />
              </div>
              <div className="mt-4"><PhotoEvidenceField title={t('Failure evidence photo', 'Failure evidence photo')} helperText={t('Capture the gate, address clue, customer note, or any proof that supports the failed attempt record.', 'မအောင်မြင်သောပို့ဆောင်မှုမှတ်တမ်းကို support လုပ်မည့် gate၊ လိပ်စာအထောက်အထား၊ customer note စသည်တို့ကိုရိုက်ပါ။')} onReady={(payload) => setPhoto(payload)} /></div>
              <div className="mt-4"><TextAreaField label={t('Exception note', 'Exception note')} value={form.note} onChange={(value) => setForm((p) => ({ ...p, note: value }))} rows={4} /></div>
              <div className="mt-4"><PrimaryButton onClick={() => void submitFailed()} disabled={busy || !form.trackingNo || !form.failureReason}><XCircle size={16} /> {busy ? t('Saving…', 'သိမ်းနေသည်…') : t('Submit failure report', 'Failure report တင်မည်')}</PrimaryButton></div>
            </Panel>
          )}
        </div>
        <div className="space-y-6">
          <PhotoGuidance assessment={photo?.assessment} />
          <Panel title={t('Delivery gate checks', 'Delivery gate checks')}>
            <GateRow label={t('Tracking code captured', 'Tracking code ရရှိ')} ok={Boolean(form.trackingNo)} />
            <GateRow label={mode === 'DELIVERED' ? t('Receiver name captured', 'လက်ခံသူအမည်ရရှိ') : t('Failure reason selected', 'Failure reason ရွေးပြီး')} ok={mode === 'DELIVERED' ? Boolean(form.deliveredTo) : Boolean(form.failureReason)} />
            <GateRow label={mode === 'DELIVERED' ? t('Signature captured', 'လက်မှတ်ရရှိ') : t('Photo evidence captured', 'Photo evidence ရရှိ')} ok={mode === 'DELIVERED' ? signature.isSigned : Boolean(photo?.file)} />
            <GateRow label={t('Photo quality acceptable', 'Photo quality သင့်တော်')} ok={(photo?.assessment?.score || 0) >= 60} />
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}

function GateRow({ label, ok }: { label: string; ok: boolean }) { return <div className={`rounded-2xl border px-4 py-3 text-sm ${ok ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/60'}`}>{label}</div>; }
function DeniedCard({ label }: { label: string }) { return <div className="min-h-screen bg-[#08101B] p-8 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6"><div className="text-lg font-black">Permission required</div><div className="mt-2 text-sm text-rose-200">You do not have access to {label}.</div></div></div>; }
