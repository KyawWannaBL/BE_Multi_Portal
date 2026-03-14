import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Search, MapPin } from 'lucide-react';
import { DeliveryBackend } from '../api';
import { canAccess, DELIVERY_PERMISSIONS } from '../permissions';
import WorkflowTimeline from '../components/WorkflowTimeline';
import { Badge, Field, Metric, Panel, PrimaryButton, ScreenShell, SecondaryButton, useBilingual } from '../shared';

export default function WayManagementScreen({ auth }: { auth?: any }) {
  const { t } = useBilingual();
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'pickup' | 'deliver' | 'failed' | 'returned' | 'transit'>('pickup');
  const [ways, setWays] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  if (!canAccess(auth, DELIVERY_PERMISSIONS.WAY_MANAGEMENT)) {
    return <DeniedCard label={t('way management', 'way management')} />;
  }

  const load = async () => {
    try {
      setBusy(true);
      const stageMap: Record<string, string> = {
        pickup: 'PICKUP_SECURED',
        deliver: 'OUT_FOR_DELIVERY',
        failed: 'FAILED_ATTEMPT',
        returned: 'RETURN_TO_HUB',
        transit: 'ROUTE_DISPATCHED',
      };
      const res = await DeliveryBackend.searchWays({ search, stage: stageMap[tab] });
      setWays(Array.isArray(res?.items) ? res.items : []);
    } catch (error: any) {
      toast.error(error?.message || t('Unable to load ways.', 'Ways များကိုမရယူနိုင်ပါ။'));
      setWays([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { void load(); }, [tab]);

  const counts = useMemo(() => ({
    total: ways.length,
    pickup: ways.filter((w) => String(w.currentStage || '').toUpperCase() === 'PICKUP_SECURED').length,
    out: ways.filter((w) => String(w.currentStage || '').toUpperCase() === 'OUT_FOR_DELIVERY').length,
    hold: ways.filter((w) => String(w.currentStage || '').toUpperCase().includes('HOLD')).length,
    failed: ways.filter((w) => String(w.currentStage || '').toUpperCase() === 'FAILED_ATTEMPT').length,
  }), [ways]);

  const openWay = async (way: any) => {
    setSelected(way);
    try {
      const res = await DeliveryBackend.getWorkflowEvents(way.id || way.deliveryId || way.trackingNo);
      setEvents(Array.isArray(res?.items) ? res.items : []);
    } catch {
      setEvents([]);
    }
  };

  return (
    <ScreenShell title={t('Way management command center', 'Way management command center')} subtitle={t('Production-ready supervisor view for pickup ways, deliver ways, failed ways, return flow, route transit, and cargo event history.', 'Pickup ways၊ deliver ways၊ failed ways၊ return flow၊ route transit နှင့် cargo event history ကိုကြည့်ရှုနိုင်သော production-ready supervisor view ဖြစ်ပါသည်။')} actions={<><SecondaryButton onClick={() => void load()} disabled={busy}><RefreshCw size={16} /> {busy ? t('Refreshing…', 'ပြန်တင်နေသည်…') : t('Refresh', 'ပြန်တင်')}</SecondaryButton></>}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Panel title={t('Operational filters', 'Operational filters')}>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Field label={t('Search', 'ရှာဖွေရန်')} value={search} onChange={setSearch} placeholder={t('Tracking, merchant, receiver, township, status…', 'Tracking, merchant, receiver, township, status…')} />
              <div className="self-end"><PrimaryButton onClick={() => void load()}><Search size={16} /> {t('Search ways', 'Way များရှာ')}</PrimaryButton></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ['pickup', t('Pickup ways', 'Pickup ways')],
                ['deliver', t('Deliver ways', 'Deliver ways')],
                ['failed', t('Failed ways', 'Failed ways')],
                ['returned', t('Return ways', 'Return ways')],
                ['transit', t('Transit route', 'Transit route')],
              ].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setTab(key as any)} className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-[0.15em] ${tab === key ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white'}`}>{label}</button>
              ))}
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-5">
            <Metric label={t('Total', 'စုစုပေါင်း')} value={counts.total} />
            <Metric label={t('Pickup', 'Pickup')} value={counts.pickup} tone="info" />
            <Metric label={t('Out for delivery', 'ပို့ဆောင်နေ')} value={counts.out} tone="success" />
            <Metric label={t('On hold', 'Hold')} value={counts.hold} tone="warning" />
            <Metric label={t('Failed', 'မအောင်မြင်')} value={counts.failed} tone="danger" />
          </div>

          <Panel title={t('Way list', 'Way list')} subtitle={t('This list is loaded from backend search results only. No local demo rows are used.', 'ဒီစာရင်းကို backend search results မှသာယူသည်။ Local demo rows မသုံးပါ။')}>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/30 text-white/45">
                  <tr>
                    <th className="p-3">{t('Tracking', 'Tracking')}</th>
                    <th className="p-3">{t('Merchant', 'Merchant')}</th>
                    <th className="p-3">{t('Receiver', 'လက်ခံသူ')}</th>
                    <th className="p-3">{t('Township', 'Township')}</th>
                    <th className="p-3">{t('Stage', 'Stage')}</th>
                    <th className="p-3">{t('Status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ways.length ? ways.map((item, index) => (
                    <tr key={item.id || index} className="cursor-pointer hover:bg-white/5" onClick={() => void openWay(item)}>
                      <td className="p-3 font-semibold text-white">{item.trackingNo || item.wayNo || '-'}</td>
                      <td className="p-3">{item.merchant || '-'}</td>
                      <td className="p-3">{item.receiver || '-'}</td>
                      <td className="p-3">{item.township || '-'}</td>
                      <td className="p-3">{item.currentStage || '-'}</td>
                      <td className="p-3">{item.status || '-'}</td>
                    </tr>
                  )) : <tr><td colSpan={6} className="p-6 text-center text-white/50">{t('No ways found for this filter.', 'ဒီ filter အတွက် ways မတွေ့ပါ။')}</td></tr>}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t('Selected way summary', 'ရွေးထားသော way summary')}>
            {selected ? (
              <div className="space-y-3 text-sm text-white/75">
                <div className="text-lg font-black text-white">{selected.trackingNo || selected.wayNo || '-'}</div>
                <div>{t('Merchant', 'Merchant')}: {selected.merchant || '-'}</div>
                <div>{t('Receiver', 'လက်ခံသူ')}: {selected.receiver || '-'}</div>
                <div>{t('Township', 'Township')}: {selected.township || '-'}</div>
                <div>{t('Current stage', 'Current stage')}: {selected.currentStage || '-'}</div>
                <div>{t('Status', 'Status')}: {selected.status || '-'}</div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selected.photoScore ? <Badge label={`${t('Photo score', 'Photo score')} ${selected.photoScore}`} tone={selected.photoScore >= 80 ? 'success' : selected.photoScore >= 60 ? 'warning' : 'danger'} /> : null}
                  {selected.lat && selected.lng ? <Badge label={`${selected.lat}, ${selected.lng}`} tone="info" /> : null}
                </div>
              </div>
            ) : <div className="text-sm text-white/60">{t('Select a way row to inspect the chain-of-custody summary and event history.', 'Chain-of-custody summary နှင့် event history ကိုကြည့်ရန် way row တစ်ခုရွေးပါ။')}</div>}
          </Panel>

          <Panel title={t('Live location summary', 'Live location summary')} subtitle={t('Use the map modules for full geospatial view. This panel provides coordinate readiness and map deep-links.', 'Full geospatial view အတွက် map modules ကိုသုံးပါ။ ဒီ panel သည် coordinate readiness နှင့် map deep-links ကိုပေးပါသည်။')}>
            {selected?.lat && selected?.lng ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-white/75"><MapPin size={16} className="text-emerald-300" /> {selected.lat}, {selected.lng}</div>
                <a href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-sky-300">{t('Open external map', 'အပြင် map ဖြင့်ဖွင့်')}</a>
              </div>
            ) : <div className="text-sm text-white/60">{t('No coordinates on selected record.', 'ရွေးထားသော record တွင် coordinates မရှိပါ။')}</div>}
          </Panel>

          <WorkflowTimeline events={events} />
        </div>
      </div>
    </ScreenShell>
  );
}

function DeniedCard({ label }: { label: string }) { return <div className="min-h-screen bg-[#08101B] p-8 text-white"><div className="mx-auto max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6"><div className="text-lg font-black">Permission required</div><div className="mt-2 text-sm text-rose-200">You do not have access to {label}.</div></div></div>; }
