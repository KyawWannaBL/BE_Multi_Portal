import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Boxes, CheckCircle2 } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { canAccess, DELIVERY_PERMISSIONS } from '../permissions';
import DeviceQrScanner from '../components/DeviceQrScanner';
import PhotoEvidenceField, { PhotoGuidance } from '../components/PhotoEvidenceField';
import { Field, Panel, PrimaryButton, ScreenShell, SelectField, TextAreaField, useBilingual } from '../shared';

export default function WarehouseExecutionScreen({ auth }: { auth?: any }) {
  const { t } = useBilingual();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ deliveryId: '', trackingNo: '', warehouse: 'Yangon Main Hub', slotCode: '', conditionStatus: 'PASS', discrepancyNote: '', riderName: '' });
  const [photo, setPhoto] = useState<any>(null);

  if (!canAccess(auth, [DELIVERY_PERMISSIONS.WAREHOUSE_INBOUND, DELIVERY_PERMISSIONS.WAREHOUSE_DISPATCH])) {
    return <DeniedCard label={t('warehouse execution', 'warehouse execution')} />;
  }

  const recordInbound = async () => {
    try {
      setBusy(true);
      let evidenceId: string | undefined;
      if (photo?.file) {
        const upload = await DeliveryBackend.uploadEvidence(photo.file, { deliveryId: form.deliveryId, trackingNo: form.trackingNo, evidenceType: 'WAREHOUSE_INBOUND_PHOTO', qualityScore: photo.assessment?.score || 0 });
        evidenceId = upload?.id;
      }
      await DeliveryBackend.warehouseInbound({ deliveryId: form.deliveryId, scannedTrackingNo: form.trackingNo, inboundWarehouse: form.warehouse, slotCode: form.slotCode, conditionStatus: form.conditionStatus, discrepancyNote: form.discrepancyNote, evidenceIds: evidenceId ? [evidenceId] : [] });
      toast.success(t('Warehouse inbound recorded.', 'Warehouse inbound ကိုမှတ်တမ်းတင်ပြီးပါပြီ။'));
    } catch (error: any) {
      toast.error(error?.message || t('Warehouse inbound failed.', 'Warehouse inbound မအောင်မြင်ပါ။'));
    } finally {
      setBusy(false);
    }
  };

  const dispatch = async () => {
    try {
      setBusy(true);
      await DeliveryBackend.warehouseDispatch({ deliveryId: form.deliveryId, trackingNo: form.trackingNo, dispatchWarehouse: form.warehouse, riderName: form.riderName });
      toast.success(t('Released to dispatch.', 'Dispatch သို့လွှတ်ပြီးပါပြီ။'));
    } catch (error: any) {
      toast.error(error?.message || t('Dispatch release failed.', 'Dispatch release မအောင်မြင်ပါ။'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell title={t('Warehouse inbound / dispatch', 'Warehouse inbound / dispatch')} subtitle={t('Warehouse staff scan inbound parcels, capture condition photos, assign slots, and release dispatch-ready cargo without relying on mock data.', 'Warehouse ဝန်ထမ်းများသည် inbound scan, condition photo, slot assignment နှင့် dispatch-ready cargo လွှတ်ပေးမှုတို့ကို mock မသုံးဘဲ ဆောင်ရွက်နိုင်ပါသည်။')} actions={<><PrimaryButton onClick={() => void recordInbound()} disabled={busy || !form.trackingNo}><CheckCircle2 size={16} /> {busy ? t('Processing…', 'လုပ်နေသည်…') : t('Record inbound', 'Inbound မှတ်တမ်းတင်')}</PrimaryButton><PrimaryButton onClick={() => void dispatch()} disabled={busy || !form.trackingNo || form.conditionStatus === 'HOLD'}><Boxes size={16} /> {t('Release dispatch', 'Dispatch သို့လွှတ်')}</PrimaryButton></>}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title={t('Inbound scan', 'Inbound scan')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Delivery id', 'Delivery id')} value={form.deliveryId} onChange={(value) => setForm((p) => ({ ...p, deliveryId: value }))} />
              <Field label={t('Warehouse', 'Warehouse')} value={form.warehouse} onChange={(value) => setForm((p) => ({ ...p, warehouse: value }))} />
            </div>
            <div className="mt-4"><DeviceQrScanner value={form.trackingNo} onChange={(value) => setForm((p) => ({ ...p, trackingNo: value }))} title={t('Inbound parcel scan', 'Inbound parcel scan')} helperText={t('The same tracking code should match what was captured at pickup.', 'Pickup တွင်ရယူထားသော tracking code နှင့် ကိုက်ညီရပါမည်။')} /></div>
          </Panel>

          <Panel title={t('Condition and slot assignment', 'Condition နှင့် slot သတ်မှတ်ခြင်း')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Slot code', 'Slot code')} value={form.slotCode} onChange={(value) => setForm((p) => ({ ...p, slotCode: value }))} />
              <SelectField label={t('Condition status', 'Condition status')} value={form.conditionStatus} onChange={(value) => setForm((p) => ({ ...p, conditionStatus: value }))} options={[{ value: 'PASS', label: 'PASS' }, { value: 'HOLD', label: 'HOLD' }, { value: 'DAMAGED', label: 'DAMAGED' }]} />
              <Field label={t('Dispatch rider / batch', 'Dispatch rider / batch')} value={form.riderName} onChange={(value) => setForm((p) => ({ ...p, riderName: value }))} />
            </div>
            <div className="mt-4"><TextAreaField label={t('Discrepancy note', 'Discrepancy note')} value={form.discrepancyNote} onChange={(value) => setForm((p) => ({ ...p, discrepancyNote: value }))} rows={4} /></div>
          </Panel>

          <Panel title={t('Inbound condition photo', 'Inbound condition photo')}>
            <PhotoEvidenceField title={t('Inbound parcel photo', 'Inbound parcel photo')} helperText={t('Capture the label, outer packaging, and any visible damage for audit and OCR review.', 'Audit နှင့် OCR review အတွက် label၊ outer packaging နှင့် damage များကိုရိုက်ပါ။')} onReady={(payload) => setPhoto(payload)} />
          </Panel>
        </div>
        <div className="space-y-6">
          <PhotoGuidance assessment={photo?.assessment} />
          <Panel title={t('Dispatch gate checks', 'Dispatch gate checks')}>
            <GateRow label={t('Parcel was inbound scanned', 'Parcel ကို inbound scan လုပ်ပြီး')} ok={Boolean(form.trackingNo)} />
            <GateRow label={t('Condition is not on hold', 'Condition HOLD မဟုတ်')} ok={form.conditionStatus !== 'HOLD'} />
            <GateRow label={t('Photo quality is acceptable', 'Photo quality သင့်တော်')} ok={(photo?.assessment?.score || 0) >= 60} />
            <GateRow label={t('Slot code assigned', 'Slot code သတ်မှတ်ပြီး')} ok={Boolean(form.slotCode)} />
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}

function GateRow({ label, ok }: { label: string; ok: boolean }) { return <div className={`rounded-2xl border px-4 py-3 text-sm ${ok ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/60'}`}>{label}</div>; }
function DeniedCard({ label }: { label: string }) { return <div className="min-h-screen bg-[#08101B] p-8 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6"><div className="text-lg font-black">Permission required</div><div className="mt-2 text-sm text-rose-200">You do not have access to {label}.</div></div></div>; }
