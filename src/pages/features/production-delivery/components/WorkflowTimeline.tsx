import React from 'react';
import { useBilingual } from '../shared';

export default function WorkflowTimeline({ events }: { events: any[] }) {
  const { t } = useBilingual();
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1626] p-5 shadow-xl">
      <div className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('Workflow timeline', 'Workflow timeline')}</div>
      <div className="space-y-4">
        {events?.length ? events.map((event: any, index: number) => (
          <div key={event.id || index} className="flex gap-4">
            <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
            <div className="flex-1 rounded-2xl border border-white/5 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">{event.eventType || event.type || '-'}</div>
                <div className="text-xs text-white/50">{event.createdAt ? new Date(event.createdAt).toLocaleString() : '-'}</div>
              </div>
              <div className="mt-1 text-xs text-white/60">{event.fromState || '-'} → {event.toState || '-'}</div>
              <div className="mt-2 text-xs text-white/70">{event.actorName || 'System'} {event.actorRole ? `• ${event.actorRole}` : ''}</div>
              {event.reason ? <div className="mt-2 text-sm text-orange-300">{event.reason}</div> : null}
            </div>
          </div>
        )) : <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white/60">{t('No workflow events yet.', 'Workflow event မရှိသေးပါ။')}</div>}
      </div>
    </div>
  );
}
