import React, { useMemo } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import { useDeliveryWays } from '@/hooks/useDeliveryData';
import { Field, Metric, Panel, PrimaryButton, ScreenShell, SecondaryButton, useBilingual } from '../shared';

type Kind = 'pickup' | 'delivery' | 'failed' | 'return' | 'parcel';

function normalize(value: any) {
  return String(value || '').trim().toLowerCase();
}

function exportCsv(filename: string, rows: any[]) {
  if (!rows.length) return;
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row?.[header] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FocusedWayListScreen({ kind }: { kind: Kind }) {
  const { t } = useBilingual();
  const {
    pickupWays,
    deliveryWays,
    failedWays,
    returnWays,
    parcelWays,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshWays,
  } = useDeliveryWays();

  const currentRows = useMemo(() => {
    switch (kind) {
      case 'pickup': return pickupWays;
      case 'delivery': return deliveryWays;
      case 'failed': return failedWays;
      case 'return': return returnWays;
      case 'parcel': return parcelWays;
      default: return [];
    }
  }, [kind, pickupWays, deliveryWays, failedWays, returnWays, parcelWays]);

  const counts = useMemo(() => ({
    total: currentRows.length,
    assigned: currentRows.filter((r) => normalize(r.status) === 'assigned').length,
    onWay: currentRows.filter((r) => ['on-way', 'in-transit', 'transit'].includes(normalize(r.status))).length,
    success: currentRows.filter((r) => normalize(r.status) === 'successful').length,
    issue: currentRows.filter((r) => normalize(r.status).includes('failed') || normalize(r.currentStage).includes('hold')).length,
  }), [currentRows]);

  const meta = {
    pickup: {
      title: t('Pickup ways operations', 'Pickup ways operations'),
      subtitle: t('Operational queue for pickup assignment, QR confirmation, custody acceptance, and pickup readiness.', 'Pickup assignment၊ QR confirmation၊ custody acceptance နှင့် pickup readiness အတွက် operational queue ဖြစ်ပါသည်။'),
    },
    delivery: {
      title: t('Delivery ways operations', 'Delivery ways operations'),
      subtitle: t('Execution view for delivery release, route progress, proof-of-delivery, and exception handling.', 'Delivery release၊ route progress၊ proof-of-delivery နှင့် exception handling အတွက် execution view ဖြစ်ပါသည်။'),
    },
    failed: {
      title: t('Failed delivery queue', 'Failed delivery queue'),
      subtitle: t('Review failed attempts with evidence readiness, reason analysis, and next action control.', 'Failed attempts များကို evidence readiness၊ reason analysis နှင့် next action control ဖြင့် ပြန်လည်ကြည့်ရှုပါ။'),
    },
    return: {
      title: t('Return flow queue', 'Return flow queue'),
      subtitle: t('Track returned cargo, route back to hub, and final return settlement visibility.', 'Returned cargo များ၏ hub သို့ပြန်သွားသည့်လမ်းကြောင်းနှင့် final return settlement ကိုကြည့်ရှုပါ။'),
    },
    parcel: {
      title: t('Parcel in / out workspace', 'Parcel in / out workspace'),
      subtitle: t('Parcel-level intake, outbound visibility, and warehouse movement review.', 'Parcel-level intake၊ outbound visibility နှင့် warehouse movement review အတွက် workspace ဖြစ်ပါသည်။'),
    },
  }[kind];

  return (
    <ScreenShell
      title={meta.title}
      subtitle={meta.subtitle}
      actions={
        <>
          <SecondaryButton onClick={refreshWays} disabled={loading}>
            <RefreshCw size={16} /> {loading ? t('Refreshing…', 'ပြန်တင်နေသည်…') : t('Refresh', 'ပြန်တင်')}
          </SecondaryButton>
          <PrimaryButton onClick={() => exportCsv(`${kind}_ways.csv`, currentRows)} disabled={!currentRows.length}>
            <Download size={16} /> {t('Export CSV', 'CSV ထုတ်')}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-6">
        <Panel title={t('Search and filter', 'Search and filter')}>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Search size={16} /></div>
              <Field label={t('Search', 'ရှာဖွေရန်')} value={searchQuery} onChange={setSearchQuery} placeholder={t('Tracking, merchant, receiver, township…', 'Tracking, merchant, receiver, township…')} />
            </div>
            <div className="self-end text-xs text-white/50">
              {t('Backend-connected list. No mock rows used.', 'Backend ချိတ်ဆက်ထားသောစာရင်းဖြစ်ပြီး mock rows မသုံးပါ။')}
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 md:grid-cols-5">
          <Metric label={t('Total', 'စုစုပေါင်း')} value={counts.total} />
          <Metric label={t('Assigned', 'Assigned')} value={counts.assigned} />
          <Metric label={t('On way', 'လမ်းတွင်')} value={counts.onWay} tone="warning" />
          <Metric label={t('Successful', 'အောင်မြင်')} value={counts.success} tone="success" />
          <Metric label={t('Issue / hold', 'ပြဿနာ / hold')} value={counts.issue} tone="danger" />
        </div>

        <Panel title={t('Way list', 'Way list')} subtitle={error ? error : t('Tap rows in your full command center for detailed timeline, map, and evidence review.', 'အသေးစိတ် timeline၊ map နှင့် evidence review အတွက် command center တွင် row ကိုရွေးပါ။')}>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 text-white/45">
                <tr>
                  <th className="p-3">{t('Tracking', 'Tracking')}</th>
                  <th className="p-3">{t('Merchant', 'Merchant')}</th>
                  <th className="p-3">{t('Receiver', 'လက်ခံသူ')}</th>
                  <th className="p-3">{t('Phone', 'ဖုန်း')}</th>
                  <th className="p-3">{t('Township', 'Township')}</th>
                  <th className="p-3">{t('Stage', 'Stage')}</th>
                  <th className="p-3">{t('Status', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentRows.length ? currentRows.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-white">{item.trackingNo || item.wayNo || '-'}</td>
                    <td className="p-3">{item.merchantName || item.merchant || '-'}</td>
                    <td className="p-3">{item.receiverName || item.receiver || '-'}</td>
                    <td className="p-3">{item.receiverPhone || '-'}</td>
                    <td className="p-3">{item.township || '-'}</td>
                    <td className="p-3">{item.currentStage || '-'}</td>
                    <td className="p-3">{item.status || '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-white/50">
                      {loading ? t('Loading ways…', 'Way များ ရယူနေသည်…') : t('No records found for this queue.', 'ဒီ queue အတွက် record မတွေ့ပါ။')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </ScreenShell>
  );
}
