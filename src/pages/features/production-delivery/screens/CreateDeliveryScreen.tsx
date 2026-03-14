import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Save, Send, QrCode } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { Badge, Field, Panel, PrimaryButton, ScreenShell, SecondaryButton, SelectField, TextAreaField, useBilingual } from '../shared';
import DeviceQrScanner from '../components/DeviceQrScanner';

export default function CreateDeliveryScreen() {
  const { t } = useBilingual();
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState({
    orderNo: '',
    qrLinkCode: '',
    merchantName: '',
    merchantPhone: '',
    merchantAddress: '',
    pickupContact: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    township: '',
    serviceLevel: 'STANDARD',
    paymentMode: 'PREPAID',
    codAmount: '0',
    fragile: false,
    temperatureSensitive: false,
    requiresWarehouseCheck: true,
    pickupWindow: '',
    deliveryWindow: '',
    pieceCount: '1',
    weightKg: '0.5',
    declaredValue: '0',
    note: '',
  });

  const readiness = useMemo(() => Boolean(draft.merchantName && draft.receiverName && draft.receiverPhone && draft.receiverAddress && Number(draft.pieceCount) > 0), [draft]);

  const payload = {
    trackingNo: draft.orderNo || draft.qrLinkCode,
    qrLinkCode: draft.qrLinkCode || draft.orderNo,
    merchantName: draft.merchantName,
    merchantPhone: draft.merchantPhone,
    merchantAddress: draft.merchantAddress,
    receiverName: draft.receiverName,
    receiverPhone: draft.receiverPhone,
    receiverAddress: draft.receiverAddress,
    township: draft.township,
    serviceLevel: draft.serviceLevel,
    paymentMode: draft.paymentMode,
    codAmount: Number(draft.codAmount || 0),
    fragile: draft.fragile,
    temperatureSensitive: draft.temperatureSensitive,
    requiresWarehouseCheck: draft.requiresWarehouseCheck,
    pickupWindow: draft.pickupWindow,
    deliveryWindow: draft.deliveryWindow,
    note: draft.note,
    parcels: [{ sku: 'MAIN', description: 'Cargo parcel', qty: Number(draft.pieceCount || 1), weightKg: Number(draft.weightKg || 0), value: Number(draft.declaredValue || 0), qrValue: draft.qrLinkCode || draft.orderNo }],
  };

  const save = async (mode: 'draft' | 'submit') => {
    try {
      setSubmitting(true);
      const result = await DeliveryBackend.createOrder({ ...payload, workflowIntent: mode });
      toast.success(mode === 'submit' ? t('Delivery order submitted.', 'Delivery order ကိုတင်သွင်းပြီးပါပြီ။') : t('Delivery draft saved.', 'Delivery draft ကိုသိမ်းပြီးပါပြီ။'));
      if (result?.trackingNo && !draft.orderNo) setDraft((prev) => ({ ...prev, orderNo: result.trackingNo }));
    } catch (error: any) {
      toast.error(error?.message || t('Unable to save delivery order.', 'Delivery order ကိုမသိမ်းနိုင်ပါ။'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenShell title={t('Create delivery order', 'Delivery order ဖန်တီးရန်')} subtitle={t('Production-ready bilingual order intake for pickup, warehouse, delivery proof, QR chain-of-custody, and downstream tracking.', 'Pickup မှ warehouse၊ delivery proof၊ QR chain-of-custody နှင့် tracking အထိ အသုံးပြုနိုင်သော bilingual production-ready order intake ဖြစ်ပါသည်။')} actions={<><SecondaryButton onClick={() => void save('draft')} disabled={!readiness || submitting}><Save size={16} /> {t('Save draft', 'Draft သိမ်း')}</SecondaryButton><PrimaryButton onClick={() => void save('submit')} disabled={!readiness || submitting}><Send size={16} /> {submitting ? t('Submitting…', 'တင်နေသည်…') : t('Create order', 'Order ဖန်တီး')}</PrimaryButton></>}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Panel title={t('Order identity and QR link', 'Order identity နှင့် QR link')} subtitle={t('The same code can flow through pickup, warehouse, dispatch, delivery proof, and customer tracking.', 'ဒီ code တစ်ခုတည်းက pickup မှ warehouse၊ dispatch၊ delivery proof နှင့် customer tracking အထိ ဆက်လက်သွားပါမည်။')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Order / tracking no', 'Order / tracking no')} value={draft.orderNo} onChange={(value) => setDraft((p) => ({ ...p, orderNo: value }))} placeholder="MM-2026-000001" />
              <Field label={t('Pickup contact', 'Pickup contact')} value={draft.pickupContact} onChange={(value) => setDraft((p) => ({ ...p, pickupContact: value }))} />
            </div>
            <div className="mt-4"><DeviceQrScanner value={draft.qrLinkCode} onChange={(value) => setDraft((p) => ({ ...p, qrLinkCode: value }))} title={t('QR / barcode link code', 'QR / Barcode link code')} helperText={t('Use the printed or assigned cargo code. This supports camera, uploaded image, and manual entry.', 'ပုံနှိပ်ထားသော သို့မဟုတ် စနစ်မှသတ်မှတ်ထားသော cargo code ကိုသုံးပါ။ camera၊ uploaded image နှင့် manual entry အားလုံးကိုထောက်ပံ့ပါသည်။')} /></div>
          </Panel>

          <Panel title={t('Merchant and pickup information', 'Merchant နှင့် pickup အချက်အလက်')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Merchant name', 'Merchant အမည်')} value={draft.merchantName} onChange={(value) => setDraft((p) => ({ ...p, merchantName: value }))} />
              <Field label={t('Merchant phone', 'Merchant ဖုန်း')} value={draft.merchantPhone} onChange={(value) => setDraft((p) => ({ ...p, merchantPhone: value }))} />
            </div>
            <div className="mt-4"><TextAreaField label={t('Merchant / pickup address', 'Merchant / pickup လိပ်စာ')} value={draft.merchantAddress} onChange={(value) => setDraft((p) => ({ ...p, merchantAddress: value }))} rows={4} /></div>
          </Panel>

          <Panel title={t('Receiver and service setup', 'လက်ခံသူနှင့် service သတ်မှတ်ချက်')}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('Receiver name', 'လက်ခံသူ အမည်')} value={draft.receiverName} onChange={(value) => setDraft((p) => ({ ...p, receiverName: value }))} />
              <Field label={t('Receiver phone', 'လက်ခံသူ ဖုန်း')} value={draft.receiverPhone} onChange={(value) => setDraft((p) => ({ ...p, receiverPhone: value }))} />
              <SelectField label={t('Service level', 'Service level')} value={draft.serviceLevel} onChange={(value) => setDraft((p) => ({ ...p, serviceLevel: value }))} options={[{ value: 'STANDARD', label: t('Standard', 'စံ') }, { value: 'EXPRESS', label: t('Express', 'အမြန်') }, { value: 'SAME_DAY', label: t('Same day', 'တစ်နေ့တည်း') }]} />
              <SelectField label={t('Payment mode', 'ငွေပေးချေမှု')} value={draft.paymentMode} onChange={(value) => setDraft((p) => ({ ...p, paymentMode: value }))} options={[{ value: 'PREPAID', label: t('Prepaid', 'ကြိုပေး') }, { value: 'COD', label: t('Cash on delivery', 'ရောက်မှပေး') }, { value: 'CREDIT', label: t('Credit', 'အကြွေး') }]} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t('COD amount', 'COD ပမာဏ')} type="number" value={draft.codAmount} onChange={(value) => setDraft((p) => ({ ...p, codAmount: value }))} />
              <Field label={t('Township / delivery zone', 'Township / delivery zone')} value={draft.township} onChange={(value) => setDraft((p) => ({ ...p, township: value }))} />
            </div>
            <div className="mt-4"><TextAreaField label={t('Receiver address', 'လက်ခံသူ လိပ်စာ')} value={draft.receiverAddress} onChange={(value) => setDraft((p) => ({ ...p, receiverAddress: value }))} rows={4} /></div>
          </Panel>

          <Panel title={t('Parcel details and handling flags', 'ပါဆယ်အသေးစိတ်နှင့် handling flags')}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label={t('Pieces', 'အရေအတွက်')} type="number" value={draft.pieceCount} onChange={(value) => setDraft((p) => ({ ...p, pieceCount: value }))} />
              <Field label={t('Weight (kg)', 'အလေးချိန် (kg)')} type="number" value={draft.weightKg} onChange={(value) => setDraft((p) => ({ ...p, weightKg: value }))} />
              <Field label={t('Declared value', 'တန်ဖိုး')} type="number" value={draft.declaredValue} onChange={(value) => setDraft((p) => ({ ...p, declaredValue: value }))} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><input type="checkbox" checked={draft.fragile} onChange={(e) => setDraft((p) => ({ ...p, fragile: e.target.checked }))} /> {t('Fragile', 'အလွယ်တကူပျက်စီးနိုင်')}</label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><input type="checkbox" checked={draft.temperatureSensitive} onChange={(e) => setDraft((p) => ({ ...p, temperatureSensitive: e.target.checked }))} /> {t('Temperature sensitive', 'အပူချိန်ထိခိုက်နိုင်')}</label>
              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><input type="checkbox" checked={draft.requiresWarehouseCheck} onChange={(e) => setDraft((p) => ({ ...p, requiresWarehouseCheck: e.target.checked }))} /> {t('Warehouse check required', 'Warehouse စစ်ဆေးရန်လို')}</label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t('Pickup window', 'Pickup အချိန်')} value={draft.pickupWindow} onChange={(value) => setDraft((p) => ({ ...p, pickupWindow: value }))} placeholder="2026-03-14 09:00-11:00" />
              <Field label={t('Delivery window', 'Delivery အချိန်')} value={draft.deliveryWindow} onChange={(value) => setDraft((p) => ({ ...p, deliveryWindow: value }))} placeholder="2026-03-14 13:00-18:00" />
            </div>
            <div className="mt-4"><TextAreaField label={t('Operations note', 'လုပ်ငန်းမှတ်ချက်')} value={draft.note} onChange={(value) => setDraft((p) => ({ ...p, note: value }))} rows={4} /></div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t('Order readiness', 'Order readiness')} subtitle={t('The platform should reject incomplete orders before they hit pickup dispatch.', 'Pickup dispatch သို့မရောက်မီ incomplete orders များကို စနစ်ကပယ်ချရမည်။')}>
            <div className="space-y-3 text-sm">
              <ReadinessRow label={t('Merchant info complete', 'Merchant အချက်အလက်ပြည့်စုံ')} ok={Boolean(draft.merchantName && draft.merchantPhone && draft.merchantAddress)} />
              <ReadinessRow label={t('Receiver info complete', 'လက်ခံသူအချက်အလက်ပြည့်စုံ')} ok={Boolean(draft.receiverName && draft.receiverPhone && draft.receiverAddress)} />
              <ReadinessRow label={t('Tracking / QR linked', 'Tracking / QR ချိတ်ဆက်ပြီး')} ok={Boolean(draft.orderNo || draft.qrLinkCode)} />
              <ReadinessRow label={t('Parcel count valid', 'ပါဆယ်အရေအတွက်မှန်')} ok={Number(draft.pieceCount || 0) > 0} />
              <ReadinessRow label={t('Route zone available', 'Route zone ရှိ')} ok={Boolean(draft.township)} />
            </div>
          </Panel>

          <Panel title={t('Process chain coverage', 'Process chain coverage')}>
            <div className="flex flex-wrap gap-2">
              <Badge label={t('QR linked', 'QR ချိတ်')} tone="info" />
              <Badge label={t('Pickup secure', 'Pickup secure')} tone="warning" />
              <Badge label={t('Warehouse scan', 'Warehouse scan')} tone="warning" />
              <Badge label={t('Proof of delivery', 'Delivery proof')} tone="success" />
              <Badge label={t('Customer tracking', 'Customer tracking')} tone="info" />
            </div>
            <div className="mt-4 text-sm text-white/65">{t('This screen is wired for production endpoints and does not rely on demo-only mocks. Backend teams can map the payload directly to order, parcel, route, and billing tables.', 'ဒီ screen သည် production endpoints များနှင့် ချိတ်ဆက်ရန်ပြင်ဆင်ထားပြီး demo-only mocks မသုံးပါ။ Backend team များသည် order, parcel, route, billing tables များသို့ payload ကိုတိုက်ရိုက်ချိတ်နိုင်ပါသည်။')}</div>
          </Panel>

          <Panel title={t('Backend fields preview', 'Backend fields preview')} aside={<QrCode size={16} className="text-emerald-300" />}>
            <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-emerald-300">{JSON.stringify(payload, null, 2)}</pre>
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}

function ReadinessRow({ label, ok }: { label: string; ok: boolean }) {
  return <div className={`rounded-2xl border px-4 py-3 ${ok ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/60'}`}>{label}</div>;
}
