import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, RefreshCw } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { canAccess, DELIVERY_PERMISSIONS } from '../permissions';
import { Field, Panel, PrimaryButton, ScreenShell, useBilingual } from '../shared';

export default function LiveTrackingScreen({ auth, mode = 'live' }: { auth?: any; mode?: 'live' | 'navigation' }) {
  const { t } = useBilingual();
  const [busy, setBusy] = useState(false);
  const [deliveryId, setDeliveryId] = useState('');
  const [snapshot, setSnapshot] = useState<any>(null);

  if (!canAccess(auth, DELIVERY_PERMISSIONS.MAP_READ)) {
    return <DeniedCard label={t('live tracking', 'live tracking')} />;
  }

  const load = async () => {
    try {
      setBusy(true);
      const res = await DeliveryBackend.getLiveTracking(deliveryId || undefined);
      setSnapshot(res || null);
    } catch (error: any) {
      toast.error(error?.message || t('Unable to load live tracking.', 'Live tracking မရယူနိုင်ပါ။'));
      setSnapshot(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <ScreenShell title={mode === 'navigation' ? t('Navigation workspace', 'Navigation workspace') : t('Live tracking map readiness', 'Live tracking map readiness')} subtitle={mode === 'navigation' ? t('Backend-driven location sharing and ETA visibility for riders and dispatch teams.', 'Rider နှင့် dispatch team များအတွက် backend-driven location sharing နှင့် ETA visibility ဖြစ်ပါသည်။') : t('This production-safe screen focuses on real backend coordinates, deep-links, and polling readiness without hardcoded demo map data.', 'Hardcoded demo map data မပါဘဲ backend coordinates, deep-links နှင့် polling readiness ကိုအဓိကထားသော production-safe screen ဖြစ်ပါသည်။')} actions={<PrimaryButton onClick={() => void load()} disabled={busy}><RefreshCw size={16} /> {busy ? t('Refreshing…', 'ပြန်တင်နေသည်…') : t('Refresh', 'ပြန်တင်')}</PrimaryButton>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <Panel title={t('Tracking filter', 'Tracking filter')}>
            <Field label={t('Delivery id (optional)', 'Delivery id (optional)')} value={deliveryId} onChange={setDeliveryId} />
            <div className="mt-4 text-sm text-white/65">{t('The screen expects backend snapshots from /tracking/live and can poll or subscribe to live updates in production.', 'ဒီ screen သည် /tracking/live မှ backend snapshot များကိုမျှော်လင့်ထားပြီး production တွင် polling သို့မဟုတ် subscribe လုပ်နိုင်ပါသည်။')}</div>
          </Panel>
          <Panel title={t('Coordinate summary', 'Coordinate summary')}>
            {snapshot?.rider ? (
              <div className="space-y-3 text-sm text-white/75">
                <div className="text-lg font-black text-white">{snapshot.rider.label || t('Rider', 'Rider')}</div>
                <div>{t('Latitude', 'Latitude')}: {snapshot.rider.lat}</div>
                <div>{t('Longitude', 'Longitude')}: {snapshot.rider.lng}</div>
                <a href={`https://www.google.com/maps?q=${snapshot.rider.lat},${snapshot.rider.lng}`} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-sky-300">{t('Open live map externally', 'အပြင် map ဖြင့်ဖွင့်')}</a>
              </div>
            ) : <div className="text-sm text-white/60">{t('No live rider snapshot yet.', 'Live rider snapshot မရှိသေးပါ။')}</div>}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title={t('Stops and ETA feed', 'Stops နှင့် ETA feed')}>
            {snapshot?.stops?.length ? (
              <div className="space-y-3">{snapshot.stops.map((stop: any, index: number) => <div key={stop.id || index} className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white/75"><div className="font-semibold text-white">{stop.label || stop.trackingNo || '-'}</div><div className="mt-1">{t('Status', 'Status')}: {stop.status || '-'}</div><div>{t('ETA', 'ETA')}: {stop.eta || '-'}</div><div className="mt-2 flex items-center gap-2 text-xs text-sky-300"><MapPin size={14} /> {stop.lat}, {stop.lng}</div></div>)}</div>
            ) : <div className="text-sm text-white/60">{t('No stop feed yet.', 'Stops feed မရှိသေးပါ။')}</div>}
          </Panel>
        </div>
      </div>
    </ScreenShell>
  );
}

function DeniedCard({ label }: { label: string }) { return <div className="min-h-screen bg-[#08101B] p-8 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6"><div className="text-lg font-black">Permission required</div><div className="mt-2 text-sm text-rose-200">You do not have access to {label}.</div></div></div>; }
