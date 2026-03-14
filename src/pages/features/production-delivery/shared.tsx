import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function useBilingual() {
  const ctx: any = useLanguage?.() ?? {};
  const lang = ctx.lang || ctx.language || 'en';
  const t = (en: string, my: string) => (lang === 'en' ? en : my);
  return { lang, t, raw: ctx };
}

export function ScreenShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08101B] text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
              Enterprise cargo operations
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-4xl text-sm text-white/65">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  aside,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1626] p-5 shadow-xl">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-white/55">{subtitle}</div> : null}
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <input
        type={type}
        value={String(value ?? '')}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-50"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0D1626] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-emerald-300 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Metric({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'success' | 'warning' | 'danger'; }) {
  const toneCls = tone === 'success' ? 'text-emerald-300' : tone === 'warning' ? 'text-amber-300' : tone === 'danger' ? 'text-rose-300' : 'text-white';
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D1626] p-5 shadow-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className={`mt-2 text-3xl font-black ${toneCls}`}>{value}</div>
    </div>
  );
}

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'; }) {
  const cls = tone === 'success'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    : tone === 'warning'
    ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
    : tone === 'danger'
    ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
    : tone === 'info'
    ? 'border-sky-500/20 bg-sky-500/10 text-sky-300'
    : 'border-white/10 bg-white/5 text-white/70';
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${cls}`}>{label}</span>;
}
