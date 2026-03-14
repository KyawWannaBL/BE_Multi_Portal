import React from "react";

export function ScreenShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070c16] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
              Enterprise delivery ops
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/65">{subtitle}</p>
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
    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-5 shadow-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">{label}</div>
      <input
        type={type}
        value={String(value ?? "")}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
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

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.15em] text-emerald-300 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
