'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileText,
  History,
  Import,
  Key,
  Lock,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Upload,
  UserCog,
  UserPlus,
  XCircle
} from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';

type Role = (typeof USER_ROLES)[keyof typeof USER_ROLES];
type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'ARCHIVED';

type Permission =
  | 'USER_READ'
  | 'USER_CREATE'
  | 'USER_APPROVE'
  | 'USER_REJECT'
  | 'USER_ROLE_EDIT'
  | 'USER_BLOCK'
  | 'USER_RESET_TOKEN'
  | 'USER_DOCS_READ'
  | 'AUTHORITY_MANAGE'
  | 'AUDIT_READ'
  | 'BULK_ACTIONS'
  | 'CSV_IMPORT'
  | 'CSV_EXPORT';

type PermissionMeta = { code: Permission; label_en: string; label_mm: string };

const PERMISSIONS: PermissionMeta[] = [
  { code: 'USER_READ', label_en: 'View accounts', label_mm: 'အကောင့်များကြည့်ရန်' },
  { code: 'USER_CREATE', label_en: 'Create account request', label_mm: 'အကောင့်တောင်းဆိုမှု ဖန်တီးရန်' },
  { code: 'USER_APPROVE', label_en: 'Approve requests', label_mm: 'တောင်းဆိုမှု အတည်ပြုရန်' },
  { code: 'USER_REJECT', label_en: 'Reject requests', label_mm: 'တောင်းဆိုမှု ငြင်းပယ်ရန်' },
  { code: 'USER_ROLE_EDIT', label_en: 'Edit roles', label_mm: 'Role ပြောင်းရန်' },
  { code: 'USER_BLOCK', label_en: 'Block/Unblock', label_mm: 'ပိတ်/ဖွင့်ရန်' },
  { code: 'USER_RESET_TOKEN', label_en: 'Reset onboarding token', label_mm: 'Onboarding token ပြန်ချရန်' },
  { code: 'USER_DOCS_READ', label_en: 'View HR docs', label_mm: 'HR စာရွက်စာတမ်းကြည့်ရန်' },
  { code: 'AUTHORITY_MANAGE', label_en: 'Manage authorities', label_mm: 'အာဏာများ စီမံရန်' },
  { code: 'AUDIT_READ', label_en: 'View audit log', label_mm: 'Audit log ကြည့်ရန်' },
  { code: 'BULK_ACTIONS', label_en: 'Bulk actions', label_mm: 'အုပ်စုလိုက်လုပ်ဆောင်မှု' },
  { code: 'CSV_IMPORT', label_en: 'CSV import', label_mm: 'CSV သွင်းရန်' },
  { code: 'CSV_EXPORT', label_en: 'CSV export', label_mm: 'CSV ထုတ်ရန်' }
];

type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;

  department?: string;
  phone?: string;
  employeeId?: string;

  createdAt: string;
  createdBy: string;

  approval?: {
    requestedAt: string;
    requestedBy: string;
    processedAt?: string;
    processedBy?: string;
    decision?: 'APPROVED' | 'REJECTED';
    note?: string;
  };

  security?: {
    onboardingTokenHash?: string;
    onboardingTokenIssuedAt?: string;
    onboardingTokenExpiresAt?: string;
    blockedAt?: string;
    blockedBy?: string;
  };

  docs?: { title: string; url: string }[];
};

type AuthorityGrant = {
  id: string;
  subjectEmail: string;
  permission: Permission;
  grantedAt: string;
  grantedBy: string;
  revokedAt?: string;
  revokedBy?: string;
};

type AuditEvent = {
  id: string;
  at: string;
  actorEmail: string;
  action: string;
  targetEmail?: string;
  detail?: string;
};

type StoreV1 = {
  v: 1;
  accounts: Account[];
  grants: AuthorityGrant[];
  audit: AuditEvent[];
  actingAsEmail: string;
};

type Store = {
  v: 2;
  accounts: Account[];
  grants: AuthorityGrant[];
  audit: AuditEvent[];
};

const STORAGE_KEY = 'account_control_store_v2';

function nowIso(): string {
  return new Date().toISOString();
}

function safeLower(s: string): string {
  return (s ?? '').toString().trim().toLowerCase();
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function isEmailValid(email: string): boolean {
  const e = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return '';
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomToken(length = 32): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);

  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function roleIsPrivileged(role: Role): boolean {
  return role === USER_ROLES.APP_OWNER || role === USER_ROLES.SUPER_ADMIN;
}

function normalizeRoleList(): Role[] {
  return Object.values(USER_ROLES) as Role[];
}

function seedStoreV2(): Store {
  const seedAccounts: Account[] = [
    {
      id: uuid(),
      name: 'MD VENTURES',
      email: 'md@britiumventures.com',
      role: USER_ROLES.APP_OWNER,
      status: 'ACTIVE',
      createdAt: nowIso(),
      createdBy: 'SYSTEM'
    },
    {
      id: uuid(),
      name: 'SUPER ADMIN',
      email: 'md@britiumexpress.com',
      role: USER_ROLES.SUPER_ADMIN,
      status: 'ACTIVE',
      createdAt: nowIso(),
      createdBy: 'SYSTEM'
    },
    {
      id: uuid(),
      name: 'STAFF ADMIN',
      email: 'staff_1@britiumexpress.com',
      role: USER_ROLES.STAFF,
      status: 'PENDING',
      createdAt: nowIso(),
      createdBy: 'SYSTEM',
      approval: { requestedAt: nowIso(), requestedBy: 'SYSTEM' }
    }
  ];

  return {
    v: 2,
    accounts: seedAccounts,
    grants: [],
    audit: [{ id: uuid(), at: nowIso(), actorEmail: 'SYSTEM', action: 'STORE_SEEDED', detail: 'Initial seed created' }]
  };
}

function migrate(raw: unknown): Store {
  const s = raw as Partial<Store> & Partial<StoreV1>;
  if (s?.v === 2 && Array.isArray(s.accounts) && Array.isArray(s.grants) && Array.isArray(s.audit)) {
    return s as Store;
  }
  if (s?.v === 1 && Array.isArray(s.accounts) && Array.isArray(s.grants) && Array.isArray(s.audit)) {
    return { v: 2, accounts: s.accounts as Account[], grants: s.grants as AuthorityGrant[], audit: s.audit as AuditEvent[] };
  }
  return seedStoreV2();
}

function loadStore(): Store {
  if (typeof window === 'undefined') return seedStoreV2();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStoreV2();
    return migrate(JSON.parse(raw));
  } catch {
    return seedStoreV2();
  }
}

function persistStore(store: Store): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getAccountByEmail(accounts: Account[], email: string): Account | undefined {
  const e = safeLower(email);
  return accounts.find((a) => safeLower(a.email) === e);
}

function activeGrantsFor(grants: AuthorityGrant[], subjectEmail: string): AuthorityGrant[] {
  const e = safeLower(subjectEmail);
  return grants.filter((g) => safeLower(g.subjectEmail) === e && !g.revokedAt);
}

function effectivePermissions(store: Store, actor: Account | undefined): Set<Permission> {
  if (!actor) return new Set();
  if (roleIsPrivileged(actor.role)) return new Set(PERMISSIONS.map((p) => p.code));
  return new Set(activeGrantsFor(store.grants, actor.email).map((g) => g.permission));
}

function can(store: Store, actor: Account | undefined, perm: Permission): boolean {
  return effectivePermissions(store, actor).has(perm);
}

function formatStatus(status: AccountStatus): { label: string; cls: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'ACTIVE', cls: 'text-emerald-400' };
    case 'PENDING':
      return { label: 'PENDING', cls: 'text-amber-400' };
    case 'SUSPENDED':
      return { label: 'SUSPENDED', cls: 'text-rose-400' };
    case 'REJECTED':
      return { label: 'REJECTED', cls: 'text-rose-400' };
    case 'ARCHIVED':
      return { label: 'ARCHIVED', cls: 'text-slate-500' };
    default:
      return { label: status, cls: 'text-slate-400' };
  }
}

function roleBadgeClass(role: Role): string {
  if (role === USER_ROLES.APP_OWNER) return 'bg-emerald-500/10 text-emerald-400';
  if (role === USER_ROLES.SUPER_ADMIN) return 'bg-sky-500/10 text-sky-400';
  return 'bg-white/5 text-slate-300';
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadBlob(filename: string, contentType: string, data: string) {
  const blob = new Blob([data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Minimal CSV parser/writer supporting quoted fields.
 */
function csvParse(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (inQuotes) {
      if (c === '"' && n === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (c !== '\r') {
        field += c;
      }
    }
  }

  row.push(field);
  rows.push(row);

  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

function csvStringify(rows: string[][]): string {
  const esc = (s: string) => {
    const needs = /[",\n\r]/.test(s);
    const out = s.replaceAll('"', '""');
    return needs ? `"${out}"` : out;
  };
  return rows.map((r) => r.map((c) => esc(c ?? '')).join(',')).join('\n');
}

function Modal(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}) {
  const { open, title, onClose, children, footer, widthClass } = props;
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTimeout(() => panelRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widthClass ?? 'max-w-2xl'} rounded-[2rem] bg-[#05080F] ring-1 ring-white/10 shadow-2xl outline-none`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/5">
              <Settings2 className="h-5 w-5 text-slate-200" />
            </div>
            <div>
              <div className="text-white font-black uppercase italic">{title}</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Enterprise_Identity_Workflow</div>
            </div>
          </div>
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
        {footer ? <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}

function Pill(props: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${props.className ?? ''}`}>{props.children}</span>;
}

function Field(props: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between gap-3">
        <label className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{props.label}</label>
        {props.hint ? <div className="text-[10px] text-slate-600 font-mono">{props.hint}</div> : null}
      </div>
      {props.children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ''}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[92px] w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ''}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-xl bg-[#0B101B] border border-white/10 px-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${props.className ?? ''}`}
    />
  );
}

function Divider() {
  return <div className="h-px w-full bg-white/5" />;
}

function tFactory(lang: string) {
  const isEn = lang === 'en';
  const dict = {
    title: { en: 'Account Control', mm: 'အကောင့်ထိန်းချုပ်မှု' },
    subtitle: { en: 'Enterprise Identity Governance', mm: 'လုပ်ငန်းသုံး Identity Governance' },
    signedInAs: { en: 'Signed in as', mm: 'အကောင့်ဖြင့်ဝင်ထားသည်' },
    notSignedIn: { en: 'Not signed in', mm: 'ဝင်မထားပါ' },
    missingEnv: { en: 'Missing Supabase env', mm: 'Supabase env မရှိပါ' },
    sessionUnregistered: { en: 'Session user not registered in Account Registry', mm: 'Session user သည် Registry ထဲတွင် မရှိပါ' },

    search: { en: 'Search accounts...', mm: 'အကောင့်ရှာရန်...' },
    create: { en: 'Create Account', mm: 'အကောင့်အသစ်ဖွင့်မည်' },
    audit: { en: 'Audit Log', mm: 'Audit Log' },
    csvExport: { en: 'Export CSV', mm: 'CSV ထုတ်ရန်' },
    csvImport: { en: 'Import CSV', mm: 'CSV သွင်းရန်' },
    bulk: { en: 'Bulk Actions', mm: 'အုပ်စုလိုက်' },

    filters: { en: 'Filters', mm: 'စစ်ထုတ်မှု' },
    status: { en: 'Status', mm: 'အခြေအနေ' },
    role: { en: 'Role', mm: 'Role' },
    reset: { en: 'Reset', mm: 'ပြန်ချ' },
    empty: { en: 'No accounts found.', mm: 'အကောင့်မတွေ့ပါ။' },
    accessDenied: { en: 'Access denied', mm: 'ဝင်ရောက်ခွင့်မရှိပါ' },
    accessHint: { en: 'Super Admin must grant you USER_READ.', mm: 'Super Admin မှ USER_READ အာဏာပေးရပါမည်။' },

    tbl_select: { en: 'Select', mm: 'ရွေးချယ်' },
    tbl_personnel: { en: 'Personnel Info', mm: 'ဝန်ထမ်းအချက်အလက်' },
    tbl_hierarchy: { en: 'Hierarchy / Authority', mm: 'Hierarchy / Authority' },
    tbl_status: { en: 'Status', mm: 'အခြေအနေ' },
    tbl_actions: { en: 'Administrative Actions', mm: 'စီမံခန့်ခွဲမှု' },

    btn_view: { en: 'View', mm: 'ကြည့်ရန်' },
    btn_docs: { en: 'Docs', mm: 'စာရွက်စာတမ်း' },
    btn_approve: { en: 'Approve', mm: 'အတည်ပြု' },
    btn_reject: { en: 'Reject', mm: 'ငြင်းပယ်' },
    btn_block: { en: 'Block', mm: 'ပိတ်' },
    btn_unblock: { en: 'Unblock', mm: 'ဖွင့်' },
    btn_role: { en: 'Role', mm: 'Role' },
    btn_auth: { en: 'Authority', mm: 'Authority' },
    btn_token: { en: 'Token', mm: 'Token' },

    create_title: { en: 'Create account request', mm: 'အကောင့်တောင်းဆိုမှု ဖန်တီးရန်' },
    approve_title: { en: 'Approve request', mm: 'တောင်းဆိုမှု အတည်ပြုရန်' },
    reject_title: { en: 'Reject request', mm: 'တောင်းဆိုမှု ငြင်းပယ်ရန်' },
    authority_title: { en: 'Manage authorities', mm: 'အာဏာများ စီမံရန်' },
    profile_title: { en: 'Account profile', mm: 'အကောင့်အချက်အလက်' },
    token_title: { en: 'Reset onboarding token', mm: 'Onboarding token ပြန်ချရန်' },
    import_title: { en: 'Import CSV', mm: 'CSV သွင်းရန်' },
    bulk_title: { en: 'Bulk actions', mm: 'အုပ်စုလိုက်လုပ်ဆောင်မှု' },

    name: { en: 'Full name', mm: 'အမည်' },
    email: { en: 'Email', mm: 'Email' },
    department: { en: 'Department', mm: 'ဌာန' },
    phone: { en: 'Phone', mm: 'ဖုန်း' },
    employeeId: { en: 'Employee ID', mm: 'ဝန်ထမ်း ID' },
    reason: { en: 'Reason / Note', mm: 'အကြောင်းရင်း / မှတ်ချက်' },

    save: { en: 'Save', mm: 'သိမ်းမည်' },
    cancel: { en: 'Cancel', mm: 'မလုပ်တော့' },
    close: { en: 'Close', mm: 'ပိတ်' },
    confirm: { en: 'Confirm', mm: 'အတည်ပြု' },
    copy: { en: 'Copy', mm: 'ကူးယူ' },

    bulk_apply: { en: 'Apply', mm: 'လုပ်ဆောင်' },
    bulk_selected: { en: 'Selected', mm: 'ရွေးထား' },
    bulk_action: { en: 'Action', mm: 'လုပ်ဆောင်ချက်' },
    bulk_note: { en: 'Note (optional)', mm: 'မှတ်ချက် (optional)' },
    bulk_set_role: { en: 'Set role', mm: 'Role သတ်မှတ်' },
    bulk_block: { en: 'Block', mm: 'ပိတ်' },
    bulk_unblock: { en: 'Unblock', mm: 'ဖွင့်' },
    bulk_approve: { en: 'Approve', mm: 'အတည်ပြု' },
    bulk_reject: { en: 'Reject', mm: 'ငြင်းပယ်' },

    csv_accounts: { en: 'Accounts CSV', mm: 'Accounts CSV' },
    csv_grants: { en: 'Authorities CSV', mm: 'Authorities CSV' },
    csv_template: { en: 'Download template', mm: 'Template ဒေါင်းလုပ်' },

    msg_saved: { en: 'Saved.', mm: 'သိမ်းပြီးပါပြီ။' },
    msg_copied: { en: 'Copied to clipboard.', mm: 'Clipboard သို့ ကူးယူပြီးပါပြီ။' },
    msg_failed: { en: 'Action failed.', mm: 'လုပ်ဆောင်မှု မအောင်မြင်ပါ။' },
    msg_invalid: { en: 'Please check required fields.', mm: 'လိုအပ်သော အချက်အလက်များ စစ်ဆေးပါ။' },
    msg_duplicate: { en: 'Email already exists.', mm: 'Email ရှိပြီးသားဖြစ်သည်။' },
    msg_import_ok: { en: 'Import completed.', mm: 'သွင်းပြီးပါပြီ။' }
  } as const;

  return (k: keyof typeof dict) => (isEn ? dict[k].en : dict[k].mm);
}

export default function AccountControl() {
  const { lang } = useLanguage();
  const t = useMemo(() => tFactory(lang), [lang]);

  const [store, setStore] = useState<Store>(() => loadStore());
  const [actorEmail, setActorEmail] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'OK' | 'NO_SESSION' | 'MISSING_ENV'>('NO_SESSION');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AccountStatus | 'ALL'>('ALL');
  const [filterRole, setFilterRole] = useState<Role | 'ALL'>('ALL');

  const [toast, setToast] = useState<{ type: 'ok' | 'err' | 'warn'; msg: string } | null>(null);

  const [modalCreate, setModalCreate] = useState(false);
  const [modalAudit, setModalAudit] = useState(false);
  const [modalProfileEmail, setModalProfileEmail] = useState<string | null>(null);
  const [modalAuthorityEmail, setModalAuthorityEmail] = useState<string | null>(null);
  const [modalApproveEmail, setModalApproveEmail] = useState<string | null>(null);
  const [modalRejectEmail, setModalRejectEmail] = useState<string | null>(null);
  const [modalTokenEmail, setModalTokenEmail] = useState<string | null>(null);
  const [modalImport, setModalImport] = useState(false);
  const [modalBulk, setModalBulk] = useState(false);

  const [busy, setBusy] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const roles = useMemo(() => normalizeRoleList(), []);

  useEffect(() => {
    persistStore(store);
  }, [store]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  /**
   * Supabase session connection:
   * - Reads currently authenticated user email.
   * - No new users are created here.
   */
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAuthState('MISSING_ENV');
      setActorEmail(null);
      return;
    }

    let unsub: (() => void) | null = null;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      if (!email) {
        setAuthState('NO_SESSION');
        setActorEmail(null);
      } else {
        setAuthState('OK');
        setActorEmail(email);
      }

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        const e = session?.user?.email ?? null;
        if (!e) {
          setAuthState('NO_SESSION');
          setActorEmail(null);
        } else {
          setAuthState('OK');
          setActorEmail(e);
        }
      });

      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => {
      unsub?.();
    };
  }, []);

  const actor = useMemo(() => (actorEmail ? getAccountByEmail(store.accounts, actorEmail) : undefined), [store.accounts, actorEmail]);
  const actorPerms = useMemo(() => effectivePermissions(store, actor), [store, actor]);

  function auditPush(event: Omit<AuditEvent, 'id' | 'at' | 'actorEmail'> & { actorEmail?: string }) {
    const a = event.actorEmail ?? actorEmail ?? 'UNKNOWN';
    const e: AuditEvent = {
      id: uuid(),
      at: nowIso(),
      actorEmail: a,
      action: event.action,
      targetEmail: event.targetEmail,
      detail: event.detail
    };
    setStore((prev) => ({ ...prev, audit: [e, ...prev.audit].slice(0, 500) }));
  }

  const sessionRegistered = authState !== 'OK' ? false : !!actor;

  const canRead = sessionRegistered && can(store, actor, 'USER_READ');
  const canCreate = sessionRegistered && can(store, actor, 'USER_CREATE');
  const canAudit = sessionRegistered && can(store, actor, 'AUDIT_READ');
  const canExport = sessionRegistered && can(store, actor, 'CSV_EXPORT');
  const canImport = sessionRegistered && can(store, actor, 'CSV_IMPORT');
  const canBulk = sessionRegistered && can(store, actor, 'BULK_ACTIONS');

  const filteredAccounts = useMemo(() => {
    const q = safeLower(searchTerm);
    return store.accounts
      .filter((a) => {
        if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
        if (filterRole !== 'ALL' && a.role !== filterRole) return false;
        if (!q) return true;
        return safeLower(a.name).includes(q) || safeLower(a.email).includes(q);
      })
      .sort((a, b) => safeLower(a.email).localeCompare(safeLower(b.email)));
  }, [store.accounts, searchTerm, filterStatus, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const paged = useMemo(() => {
    const p = Math.min(page, totalPages);
    const start = (p - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus, filterRole]);

  function upsertAccount(next: Account) {
    setStore((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (safeLower(a.email) === safeLower(next.email) ? next : a))
    }));
  }

  function addAccount(acc: Account) {
    setStore((prev) => ({ ...prev, accounts: [acc, ...prev.accounts] }));
  }

  function ensureAtLeastOneSuperAdminActive(nextAccounts: Account[]): boolean {
    const superAdmins = nextAccounts.filter((a) => a.role === USER_ROLES.SUPER_ADMIN && a.status === 'ACTIVE');
    return superAdmins.length >= 1;
  }

  function grantPermission(subjectEmail: string, permission: Permission) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'AUTHORITY_MANAGE')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }
    const actorIsPriv = roleIsPrivileged(actor.role);
    if (!actorIsPriv && !actorPerms.has(permission)) {
      setToast({ type: 'err', msg: 'Cannot grant a permission you do not have.' });
      return;
    }

    const subject = getAccountByEmail(store.accounts, subjectEmail);
    if (!subject) return;

    if (!actorIsPriv && roleIsPrivileged(subject.role)) {
      setToast({ type: 'err', msg: 'Cannot modify privileged accounts.' });
      return;
    }

    const already = store.grants.some(
      (g) => safeLower(g.subjectEmail) === safeLower(subjectEmail) && g.permission === permission && !g.revokedAt
    );
    if (already) return;

    const g: AuthorityGrant = {
      id: uuid(),
      subjectEmail,
      permission,
      grantedAt: nowIso(),
      grantedBy: actorEmail
    };

    setStore((prev) => ({ ...prev, grants: [g, ...prev.grants] }));
    auditPush({ action: 'AUTHORITY_GRANTED', targetEmail: subjectEmail, detail: `${permission} granted by ${actorEmail}` });
    setToast({ type: 'ok', msg: t('msg_saved') });
  }

  function revokePermission(subjectEmail: string, permission: Permission) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'AUTHORITY_MANAGE')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }

    const subject = getAccountByEmail(store.accounts, subjectEmail);
    if (!subject) return;

    const actorIsPriv = roleIsPrivileged(actor.role);
    if (!actorIsPriv && roleIsPrivileged(subject.role)) {
      setToast({ type: 'err', msg: 'Cannot modify privileged accounts.' });
      return;
    }

    setStore((prev) => ({
      ...prev,
      grants: prev.grants.map((g) => {
        if (safeLower(g.subjectEmail) !== safeLower(subjectEmail)) return g;
        if (g.permission !== permission) return g;
        if (g.revokedAt) return g;
        return { ...g, revokedAt: nowIso(), revokedBy: actorEmail };
      })
    }));

    auditPush({ action: 'AUTHORITY_REVOKED', targetEmail: subjectEmail, detail: `${permission} revoked by ${actorEmail}` });
    setToast({ type: 'ok', msg: t('msg_saved') });
  }

  const [rawTokenForDisplay, setRawTokenForDisplay] = useState<{ email: string; token: string; expiresAt: string } | null>(null);

  async function resetOnboardingToken(email: string) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'USER_RESET_TOKEN')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }

    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    setBusy(true);
    try {
      const token = randomToken(36);
      const hash = await sha256Hex(token);
      const issuedAt = nowIso();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const next: Account = {
        ...target,
        security: {
          ...(target.security ?? {}),
          onboardingTokenHash: hash || undefined,
          onboardingTokenIssuedAt: issuedAt,
          onboardingTokenExpiresAt: expiresAt
        }
      };

      upsertAccount(next);
      auditPush({ action: 'ONBOARDING_TOKEN_RESET', targetEmail: email, detail: `Token reset by ${actorEmail}` });

      setModalTokenEmail(email);
      setToast({ type: 'ok', msg: t('msg_saved') });
      setRawTokenForDisplay({ email, token, expiresAt });
    } catch {
      setToast({ type: 'err', msg: t('msg_failed') });
    } finally {
      setBusy(false);
    }
  }

  function blockToggle(email: string, block: boolean) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'USER_BLOCK')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }

    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) {
      setToast({ type: 'err', msg: 'Cannot modify privileged accounts.' });
      return;
    }

    const next: Account = {
      ...target,
      status: block ? 'SUSPENDED' : 'ACTIVE',
      security: {
        ...(target.security ?? {}),
        blockedAt: block ? nowIso() : undefined,
        blockedBy: block ? actorEmail : undefined
      }
    };

    upsertAccount(next);
    auditPush({ action: block ? 'ACCOUNT_BLOCKED' : 'ACCOUNT_UNBLOCKED', targetEmail: email, detail: `By ${actorEmail}` });
    setToast({ type: 'ok', msg: t('msg_saved') });
  }

  function changeRole(email: string, role: Role) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'USER_ROLE_EDIT')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }

    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    if (!roleIsPrivileged(actor.role) && roleIsPrivileged(target.role)) {
      setToast({ type: 'err', msg: 'Cannot modify privileged accounts.' });
      return;
    }

    const next: Account = { ...target, role };
    const nextAccounts = store.accounts.map((a) => (safeLower(a.email) === safeLower(email) ? next : a));

    if (!ensureAtLeastOneSuperAdminActive(nextAccounts)) {
      setToast({ type: 'err', msg: 'Must keep at least one ACTIVE SUPER_ADMIN.' });
      return;
    }

    setStore((prev) => ({ ...prev, accounts: nextAccounts }));
    auditPush({ action: 'ROLE_CHANGED', targetEmail: email, detail: `Role -> ${role} by ${actorEmail}` });
    setToast({ type: 'ok', msg: t('msg_saved') });
  }

  function approve(email: string, note?: string) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'USER_APPROVE')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }

    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    const next: Account = {
      ...target,
      status: 'ACTIVE',
      approval: {
        requestedAt: target.approval?.requestedAt ?? target.createdAt,
        requestedBy: target.approval?.requestedBy ?? target.createdBy,
        processedAt: nowIso(),
        processedBy: actorEmail,
        decision: 'APPROVED',
        note
      }
    };

    upsertAccount(next);
    auditPush({ action: 'REQUEST_APPROVED', targetEmail: email, detail: note ?? 'Approved' });
    setToast({ type: 'ok', msg: t('msg_saved') });
  }

  function reject(email: string, note?: string) {
    if (!actor || !actorEmail) return;
    if (!can(store, actor, 'USER_REJECT')) {
      setToast({ type: 'err', msg: t('accessDenied') });
      return;
    }

    const target = getAccountByEmail(store.accounts, email);
    if (!target) return;

    const next: Account = {
      ...target,
      status: 'REJECTED',
      approval: {
        requestedAt: target.approval?.requestedAt ?? target.createdAt,
        requestedBy: target.approval?.requestedBy ?? target.createdBy,
        processedAt: nowIso(),
        processedBy: actorEmail,
        decision: 'REJECTED',
        note
      }
    };

    upsertAccount(next);
    auditPush({ action: 'REQUEST_REJECTED', targetEmail: email, detail: note ?? 'Rejected' });
    setToast({ type: 'ok', msg: t('msg_saved') });
  }

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedEmails = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  function selectAllOnPage(checked: boolean) {
    const next = { ...selected };
    for (const a of paged) next[a.email] = checked;
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

  function exportAccountsCsv() {
    const header = [
      'name',
      'email',
      'role',
      'status',
      'department',
      'phone',
      'employeeId',
      'createdAt',
      'createdBy',
      'approvalDecision',
      'approvalRequestedBy',
      'approvalProcessedBy',
      'approvalNote'
    ];
    const rows: string[][] = [header];

    for (const a of filteredAccounts) {
      rows.push([
        a.name ?? '',
        a.email ?? '',
        a.role ?? '',
        a.status ?? '',
        a.department ?? '',
        a.phone ?? '',
        a.employeeId ?? '',
        a.createdAt ?? '',
        a.createdBy ?? '',
        a.approval?.decision ?? '',
        a.approval?.requestedBy ?? '',
        a.approval?.processedBy ?? '',
        a.approval?.note ?? ''
      ]);
    }

    downloadBlob(`accounts_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8', csvStringify(rows));
    auditPush({ action: 'CSV_EXPORT_ACCOUNTS', detail: `Rows=${filteredAccounts.length}` });
  }

  function exportGrantsCsv() {
    const header = ['subjectEmail', 'permission', 'grantedAt', 'grantedBy', 'revokedAt', 'revokedBy'];
    const rows: string[][] = [header];
    for (const g of store.grants) {
      rows.push([g.subjectEmail, g.permission, g.grantedAt, g.grantedBy, g.revokedAt ?? '', g.revokedBy ?? '']);
    }
    downloadBlob(`authorities_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8', csvStringify(rows));
    auditPush({ action: 'CSV_EXPORT_AUTHORITIES', detail: `Rows=${store.grants.length}` });
  }

  function downloadImportTemplate() {
    const header = ['name', 'email', 'role', 'department', 'phone', 'employeeId', 'note'];
    const rows = [header, ['Aung Min', 'aung.min@company.com', USER_ROLES.STAFF, 'Operations', '+95...', 'EMP-001', 'New hire']];
    downloadBlob('accounts_import_template.csv', 'text/csv;charset=utf-8', csvStringify(rows));
  }

  const CreateForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>(roles.includes(USER_ROLES.STAFF) ? USER_ROLES.STAFF : roles[0]);
    const [department, setDepartment] = useState('');
    const [phone, setPhone] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [reason, setReason] = useState('');
    const [instantApprove, setInstantApprove] = useState(false);

    const canInstant = actor ? can(store, actor, 'USER_APPROVE') : false;

    function submit() {
      if (!actor || !actorEmail) return;
      const cleanEmail = email.trim();
      if (!name.trim() || !isEmailValid(cleanEmail)) {
        setToast({ type: 'err', msg: t('msg_invalid') });
        return;
      }
      if (getAccountByEmail(store.accounts, cleanEmail)) {
        setToast({ type: 'err', msg: t('msg_duplicate') });
        return;
      }

      const createdAt = nowIso();
      const acc: Account = {
        id: uuid(),
        name: name.trim(),
        email: cleanEmail,
        role,
        status: 'PENDING',
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
        createdAt,
        createdBy: actorEmail,
        approval: { requestedAt: createdAt, requestedBy: actorEmail },
        docs: []
      };

      addAccount(acc);
      auditPush({ action: 'REQUEST_CREATED', targetEmail: cleanEmail, detail: reason?.trim() ? `Note: ${reason.trim()}` : 'Created' });

      if (canInstant && instantApprove) {
        approve(cleanEmail, reason?.trim() || 'Instant approval');
      }

      setModalCreate(false);
      setToast({ type: 'ok', msg: t('msg_saved') });
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aung Min" />
          </Field>
          <Field label={t('email')}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </Field>
          <Field label={t('role')}>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('department')}>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Operations" />
          </Field>
          <Field label={t('phone')}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+95..." />
          </Field>
          <Field label={t('employeeId')}>
            <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP-00135" />
          </Field>
        </div>

        <Field label={t('reason')}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why creating this account request?" />
        </Field>

        {canInstant ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
              <div>
                <div className="text-white font-bold">Instant approval</div>
                <div className="text-xs text-slate-500">You have approval authority.</div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={instantApprove}
                onChange={(e) => setInstantApprove(e.target.checked)}
                className="h-4 w-4 accent-sky-500"
              />
              Enable
            </label>
          </div>
        ) : null}

        <Divider />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalCreate(false)}>
            {t('cancel')}
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-11 px-6 rounded-xl uppercase" onClick={submit}>
            {t('save')}
          </Button>
        </div>
      </div>
    );
  };

  const ProfileModal = ({ email }: { email: string }) => {
    const target = getAccountByEmail(store.accounts, email);
    if (!target) return null;

    const grants = activeGrantsFor(store.grants, target.email);

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-white font-black uppercase italic">{target.name}</div>
            <div className="text-slate-500 text-sm">{target.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Pill className={roleBadgeClass(target.role)}>{target.role}</Pill>
            <Pill className="bg-white/5 text-slate-300">{target.department ?? '-'}</Pill>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-[#0B101B] border-none ring-1 ring-white/10 rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">STATUS</div>
            <div className={`mt-2 font-black ${formatStatus(target.status).cls}`}>{formatStatus(target.status).label}</div>
          </Card>
          <Card className="bg-[#0B101B] border-none ring-1 ring-white/10 rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">CREATED</div>
            <div className="mt-2 text-sm text-slate-200">{new Date(target.createdAt).toLocaleString()}</div>
            <div className="text-xs text-slate-600">{target.createdBy}</div>
          </Card>
          <Card className="bg-[#0B101B] border-none ring-1 ring-white/10 rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">APPROVAL</div>
            <div className="mt-2 text-sm text-slate-200">{target.approval?.decision ?? '—'}</div>
            <div className="text-xs text-slate-600">{target.approval?.processedBy ?? ''}</div>
          </Card>
        </div>

        <Divider />

        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">Authorities</div>
          <div className="flex flex-wrap gap-2">
            {roleIsPrivileged(target.role) ? (
              <Pill className="bg-sky-500/10 text-sky-400">ALL_PERMISSIONS (Privileged)</Pill>
            ) : grants.length ? (
              grants.map((g) => (
                <Pill key={g.id} className="bg-white/5 text-slate-200">
                  {g.permission}
                </Pill>
              ))
            ) : (
              <div className="text-sm text-slate-600">No delegated permissions.</div>
            )}
          </div>
        </div>

        <Divider />

        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">HR Docs (placeholder)</div>
          <div className="text-sm text-slate-600">
            Replace docs[] with your doc service and enforce access server-side. (UI gated by USER_DOCS_READ)
          </div>
        </div>
      </div>
    );
  };

  const ApproveRejectModal = ({ email, mode }: { email: string; mode: 'approve' | 'reject' }) => {
    const target = getAccountByEmail(store.accounts, email);
    const [note, setNote] = useState('');

    if (!target) return null;

    const ok = () => {
      if (mode === 'approve') approve(email, note.trim() || undefined);
      else reject(email, note.trim() || undefined);
      setModalApproveEmail(null);
      setModalRejectEmail(null);
    };

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-white font-black uppercase italic">{target.name}</div>
              <div className="text-sm text-slate-500">{target.email}</div>
            </div>
            <Pill className={roleBadgeClass(target.role)}>{target.role}</Pill>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Requested by: <span className="text-slate-400">{target.approval?.requestedBy ?? target.createdBy}</span>
          </div>
        </div>

        <Field label={t('reason')}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Approval note..." />
        </Field>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => (mode === 'approve' ? setModalApproveEmail(null) : setModalRejectEmail(null))}>
            {t('cancel')}
          </Button>
          <Button
            className={`${mode === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'} text-white font-black h-11 px-6 rounded-xl uppercase`}
            onClick={ok}
          >
            {mode === 'approve' ? t('btn_approve') : t('btn_reject')}
          </Button>
        </div>
      </div>
    );
  };

  const AuthorityModal = ({ email }: { email: string }) => {
    const subject = getAccountByEmail(store.accounts, email);
    if (!subject) return null;

    const subjectPerms = roleIsPrivileged(subject.role)
      ? new Set(PERMISSIONS.map((p) => p.code))
      : new Set(activeGrantsFor(store.grants, subject.email).map((g) => g.permission));

    const actorIsPriv = actor ? roleIsPrivileged(actor.role) : false;

    return (
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-white font-black uppercase italic">{subject.name}</div>
              <div className="text-sm text-slate-500">{subject.email}</div>
            </div>
            <Pill className={roleBadgeClass(subject.role)}>{subject.role}</Pill>
          </div>

          {!actorIsPriv && roleIsPrivileged(subject.role) ? (
            <div className="mt-3 flex items-center gap-2 text-amber-300 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Privileged accounts can only be modified by SUPER_ADMIN / APP_OWNER.
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERMISSIONS.map((p) => {
            const enabled = subjectPerms.has(p.code);
            const disabledByPolicy =
              !actor || !can(store, actor, 'AUTHORITY_MANAGE') || (!actorIsPriv && !actorPerms.has(p.code));
            const label = lang === 'en' ? p.label_en : p.label_mm;

            return (
              <div key={p.code} className={`p-4 rounded-2xl border ${enabled ? 'border-sky-500/20 bg-sky-500/5' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-bold">{label}</div>
                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{p.code}</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={disabledByPolicy}
                      onChange={(e) => {
                        if (e.target.checked) grantPermission(subject.email, p.code);
                        else revokePermission(subject.email, p.code);
                      }}
                      className="h-4 w-4 accent-sky-500 disabled:opacity-50"
                    />
                    {enabled ? 'ON' : 'OFF'}
                  </label>
                </div>
                {!actorIsPriv && actor && !actorPerms.has(p.code) ? (
                  <div className="mt-2 text-xs text-slate-600">You must hold this permission to grant it.</div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalAuthorityEmail(null)}>
            {t('close')}
          </Button>
        </div>
      </div>
    );
  };

  const AuditModal = () => {
    const events = store.audit.slice(0, 200);
    return (
      <div className="space-y-4">
        <div className="text-sm text-slate-500">Showing latest {events.length} events (max 200).</div>
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {events.map((e) => (
            <div key={e.id} className="p-3 rounded-2xl bg-[#0B101B] border border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="text-white font-bold">{e.action}</div>
                <div className="text-[10px] font-mono text-slate-600">{new Date(e.at).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Actor: <span className="text-slate-300">{e.actorEmail}</span>
                {e.targetEmail ? (
                  <>
                    {' '}
                    • Target: <span className="text-slate-300">{e.targetEmail}</span>
                  </>
                ) : null}
              </div>
              {e.detail ? <div className="mt-1 text-xs text-slate-600">{e.detail}</div> : null}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalAudit(false)}>
            {t('close')}
          </Button>
        </div>
      </div>
    );
  };

  const TokenModal = ({ email }: { email: string }) => {
    const target = getAccountByEmail(store.accounts, email);
    const tokenInfo = rawTokenForDisplay && safeLower(rawTokenForDisplay.email) === safeLower(email) ? rawTokenForDisplay : null;
    if (!target) return null;

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-white font-black uppercase italic">{target.name}</div>
          <div className="text-sm text-slate-500">{target.email}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B101B] border border-white/10">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">ONBOARDING TOKEN</div>
          <div className="mt-2 text-sm text-slate-200 break-all">
            {tokenInfo ? tokenInfo.token : <span className="text-slate-600">Token not in memory. Reset again to display.</span>}
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Expires:{' '}
            {tokenInfo?.expiresAt
              ? new Date(tokenInfo.expiresAt).toLocaleString()
              : target.security?.onboardingTokenExpiresAt
                ? new Date(target.security.onboardingTokenExpiresAt).toLocaleString()
                : '—'}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button
              className="bg-white/10 hover:bg-white/15 text-white h-10 px-4 rounded-xl"
              onClick={async () => {
                if (!tokenInfo?.token) return;
                const ok = await copy(tokenInfo.token);
                setToast({ type: ok ? 'ok' : 'err', msg: ok ? t('msg_copied') : t('msg_failed') });
              }}
            >
              <ClipboardCopy className="h-4 w-4 mr-2" />
              {t('copy')}
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalTokenEmail(null)}>
            {t('close')}
          </Button>
        </div>
      </div>
    );
  };

  const ImportModal = () => {
    const [fileName, setFileName] = useState<string>('');
    const [preview, setPreview] = useState<{ ok: number; skipped: number; errors: string[]; rows: Account[] } | null>(null);

    async function onPick(file: File | null) {
      if (!file) return;
      setFileName(file.name);
      const text = await file.text();
      const parsed = csvParse(text);
      const header = parsed[0]?.map((h) => safeLower(h));
      if (!header || header.length < 2) {
        setPreview({ ok: 0, skipped: 0, errors: ['Invalid CSV header.'], rows: [] });
        return;
      }

      const idx = (key: string) => header.indexOf(safeLower(key));
      const iName = idx('name');
      const iEmail = idx('email');
      const iRole = idx('role');
      const iDept = idx('department');
      const iPhone = idx('phone');
      const iEmp = idx('employeeId');
      const iNote = idx('note');

      const errors: string[] = [];
      const rows: Account[] = [];
      let skipped = 0;

      for (let r = 1; r < parsed.length; r++) {
        const row = parsed[r];
        const name = (row[iName] ?? '').trim();
        const email = (row[iEmail] ?? '').trim();
        const role = (row[iRole] ?? USER_ROLES.STAFF).trim() as Role;
        const department = (row[iDept] ?? '').trim();
        const phone = (row[iPhone] ?? '').trim();
        const employeeId = (row[iEmp] ?? '').trim();
        const note = (row[iNote] ?? '').trim();

        if (!name || !isEmailValid(email)) {
          errors.push(`Row ${r + 1}: invalid name/email`);
          continue;
        }

        const exists = getAccountByEmail(store.accounts, email);
        if (exists) {
          skipped++;
          continue;
        }

        const createdAt = nowIso();
        rows.push({
          id: uuid(),
          name,
          email,
          role: roles.includes(role) ? role : (USER_ROLES.STAFF as Role),
          status: 'PENDING',
          department: department || undefined,
          phone: phone || undefined,
          employeeId: employeeId || undefined,
          createdAt,
          createdBy: actorEmail ?? 'UNKNOWN',
          approval: { requestedAt: createdAt, requestedBy: actorEmail ?? 'UNKNOWN', note: note || undefined },
          docs: []
        });
      }

      setPreview({ ok: rows.length, skipped, errors, rows });
    }

    function doImport() {
      if (!preview || !actor || !actorEmail) return;
      if (!can(store, actor, 'CSV_IMPORT')) {
        setToast({ type: 'err', msg: t('accessDenied') });
        return;
      }

      setStore((prev) => ({ ...prev, accounts: [...preview.rows, ...prev.accounts] }));
      auditPush({ action: 'CSV_IMPORT_ACCOUNTS', detail: `Imported=${preview.ok} Skipped=${preview.skipped} Errors=${preview.errors.length}` });
      setToast({ type: 'ok', msg: t('msg_import_ok') });
      setModalImport(false);
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-slate-500">
            {t('csv_template')}:&nbsp;
            <Button className="bg-white/10 hover:bg-white/15 text-white h-10 px-4 rounded-xl" onClick={downloadImportTemplate}>
              <Download className="h-4 w-4 mr-2" />
              {t('csv_template')}
            </Button>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-10 px-4 rounded-xl uppercase">
              <Upload className="h-4 w-4 mr-2" />
              {fileName ? fileName : t('csvImport')}
            </Button>
          </label>
        </div>

        {preview ? (
          <div className="p-4 rounded-2xl bg-[#0B101B] border border-white/10 space-y-2">
            <div className="text-sm text-slate-300">
              OK: <span className="text-emerald-300 font-bold">{preview.ok}</span> • Skipped (duplicates):{' '}
              <span className="text-amber-300 font-bold">{preview.skipped}</span> • Errors:{' '}
              <span className="text-rose-300 font-bold">{preview.errors.length}</span>
            </div>
            {preview.errors.length ? (
              <div className="text-xs text-rose-300 space-y-1 max-h-28 overflow-auto pr-1">
                {preview.errors.slice(0, 50).map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalImport(false)}>
            {t('cancel')}
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-11 px-6 rounded-xl uppercase disabled:opacity-40"
            disabled={!preview?.ok}
            onClick={doImport}
          >
            <Import className="h-4 w-4 mr-2" />
            {t('confirm')}
          </Button>
        </div>
      </div>
    );
  };

  const BulkModal = () => {
    const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'BLOCK' | 'UNBLOCK' | 'SET_ROLE'>('APPROVE');
    const [note, setNote] = useState('');
    const [role, setRole] = useState<Role>(USER_ROLES.STAFF as Role);

    function apply() {
      if (!actor || !actorEmail) return;
      if (!can(store, actor, 'BULK_ACTIONS')) {
        setToast({ type: 'err', msg: t('accessDenied') });
        return;
      }
      if (!selectedEmails.length) return;

      for (const email of selectedEmails) {
        if (action === 'APPROVE') approve(email, note.trim() || undefined);
        if (action === 'REJECT') reject(email, note.trim() || undefined);
        if (action === 'BLOCK') blockToggle(email, true);
        if (action === 'UNBLOCK') blockToggle(email, false);
        if (action === 'SET_ROLE') changeRole(email, role);
      }

      auditPush({ action: 'BULK_APPLIED', detail: `Action=${action} Count=${selectedEmails.length}` });
      clearSelection();
      setModalBulk(false);
    }

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="text-slate-300">
            {t('bulk_selected')}: <span className="font-black text-white">{selectedEmails.length}</span>
          </div>
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={clearSelection}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('bulk_action')}>
            <Select value={action} onChange={(e) => setAction(e.target.value as any)}>
              <option value="APPROVE">{t('bulk_approve')}</option>
              <option value="REJECT">{t('bulk_reject')}</option>
              <option value="BLOCK">{t('bulk_block')}</option>
              <option value="UNBLOCK">{t('bulk_unblock')}</option>
              <option value="SET_ROLE">{t('bulk_set_role')}</option>
            </Select>
          </Field>

          {action === 'SET_ROLE' ? (
            <Field label={t('role')}>
              <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <div />
          )}
        </div>

        <Field label={t('bulk_note')}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional..." />
        </Field>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setModalBulk(false)}>
            {t('cancel')}
          </Button>
          <Button
            className="bg-sky-600 hover:bg-sky-500 text-white font-black h-11 px-6 rounded-xl uppercase disabled:opacity-40"
            disabled={!selectedEmails.length}
            onClick={apply}
          >
            {t('bulk_apply')}
          </Button>
        </div>
      </div>
    );
  };

  const authLabel =
    authState === 'MISSING_ENV'
      ? t('missingEnv')
      : authState === 'NO_SESSION'
        ? t('notSignedIn')
        : actorEmail
          ? `${t('signedInAs')}: ${actorEmail}`
          : t('notSignedIn');

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#0B101B] min-h-screen text-slate-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[#05080F] p-6 md:p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-sky-500/10 rounded-2xl">
            <UserPlus className="text-sky-500 h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic">{t('title')}</h1>
            <p className="text-sky-500 font-mono text-[10px] uppercase tracking-widest italic">{t('subtitle')}</p>
            <p className="text-xs text-slate-500 mt-1">{authLabel}</p>
            {authState === 'OK' && !sessionRegistered ? (
              <p className="text-xs text-amber-300 mt-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t('sessionUnregistered')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              className="bg-[#0B101B] border border-white/10 rounded-full h-12 pl-12 pr-6 text-sm w-full md:w-72"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canExport ? (
              <>
                <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={exportAccountsCsv}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('csvExport')}
                </Button>
                <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={exportGrantsCsv}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('csv_grants')}
                </Button>
              </>
            ) : null}

            {canImport ? (
              <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalImport(true)}>
                <Upload className="h-4 w-4 mr-2" />
                {t('csvImport')}
              </Button>
            ) : null}

            {canBulk ? (
              <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalBulk(true)}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                {t('bulk')}
              </Button>
            ) : null}

            {canAudit ? (
              <Button className="bg-white/5 hover:bg-white/10 text-white font-black h-12 px-5 rounded-xl uppercase" onClick={() => setModalAudit(true)}>
                <History className="h-4 w-4 mr-2" />
                {t('audit')}
              </Button>
            ) : null}

            {canCreate ? (
              <Button className="bg-sky-600 hover:bg-sky-500 text-white font-black h-12 px-6 rounded-xl uppercase" onClick={() => setModalCreate(true)}>
                {t('create')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {toast ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm flex items-center gap-2 ${
            toast.type === 'ok'
              ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
              : toast.type === 'warn'
                ? 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                : 'border-rose-500/20 bg-rose-500/5 text-rose-300'
          }`}
        >
          {toast.type === 'ok' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : toast.type === 'warn' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <div>{toast.msg}</div>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Pill className="bg-white/5 text-slate-300">{t('filters')}</Pill>

          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t('status')}</div>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AccountStatus | 'ALL')} className="w-44">
              <option value="ALL">ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{t('role')}</div>
            <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value as Role | 'ALL')} className="w-48">
              <option value="ALL">ALL</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant="ghost"
            className="h-11 text-slate-400 hover:text-white"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('ALL');
              setFilterRole('ALL');
              setToast({ type: 'ok', msg: t('reset') });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('reset')}
          </Button>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          PERMS: {roleIsPrivileged(actor?.role as Role) ? 'ALL (Privileged)' : Array.from(actorPerms).join(', ') || '—'}
        </div>
      </div>

      {!canRead ? (
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <div>
              <div className="text-white font-black uppercase italic">{t('accessDenied')}</div>
              <div className="text-sm text-slate-500">{t('accessHint')}</div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-[#05080F] border-none ring-1 ring-white/5 rounded-[3rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 font-mono text-slate-500 uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="p-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sky-500"
                      checked={paged.length > 0 && paged.every((a) => selected[a.email])}
                      onChange={(e) => selectAllOnPage(e.target.checked)}
                      disabled={!canBulk}
                      title={t('tbl_select')}
                    />
                    {t('tbl_select')}
                  </label>
                </th>
                <th className="p-6">{t('tbl_personnel')}</th>
                <th className="p-6">{t('tbl_hierarchy')}</th>
                <th className="p-6">{t('tbl_status')}</th>
                <th className="p-6 text-right">{t('tbl_actions')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {paged.map((user) => {
                const st = formatStatus(user.status);

                const canApprove = can(store, actor, 'USER_APPROVE');
                const canReject = can(store, actor, 'USER_REJECT');
                const canDocs = can(store, actor, 'USER_DOCS_READ');
                const canResetToken = can(store, actor, 'USER_RESET_TOKEN');
                const canBlock = can(store, actor, 'USER_BLOCK');
                const canRoleEdit = can(store, actor, 'USER_ROLE_EDIT');
                const canAuth = can(store, actor, 'AUTHORITY_MANAGE');

                return (
                  <tr key={user.email} className="hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-sky-500"
                        checked={!!selected[user.email]}
                        disabled={!canBulk}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [user.email]: e.target.checked }))}
                      />
                    </td>

                    <td className="p-6">
                      <p className="font-bold text-white uppercase italic">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.department ? <Pill className="bg-white/5 text-slate-300">{user.department}</Pill> : null}
                        {user.employeeId ? <Pill className="bg-white/5 text-slate-300">{user.employeeId}</Pill> : null}
                      </div>
                    </td>

                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${roleBadgeClass(user.role)}`}>{user.role}</span>
                      {user.status === 'PENDING' ? (
                        <div className="mt-2 text-xs text-slate-600">
                          Pending approval
                          {user.approval?.requestedBy ? <span className="text-slate-500"> • {user.approval.requestedBy}</span> : null}
                        </div>
                      ) : null}
                    </td>

                    <td className="p-6">
                      <span className={`text-[10px] font-bold italic ${st.cls}`}>{st.label}</span>
                    </td>

                    <td className="p-6 text-right space-x-1 md:space-x-2">
                      <Button variant="ghost" className="h-10 text-slate-500 hover:text-white" title={t('btn_view')} onClick={() => setModalProfileEmail(user.email)}>
                        <UserCog size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        className="h-10 text-slate-500 hover:text-white disabled:opacity-40"
                        title={t('btn_docs')}
                        disabled={!canDocs}
                        onClick={() => setModalProfileEmail(user.email)}
                      >
                        <FileText size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        className="h-10 text-slate-500 hover:text-white disabled:opacity-40"
                        title={t('btn_token')}
                        disabled={!canResetToken || busy}
                        onClick={() => resetOnboardingToken(user.email)}
                      >
                        <Key size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        className={`h-10 ${user.status === 'SUSPENDED' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-500 hover:bg-rose-500/10'} disabled:opacity-40`}
                        title={user.status === 'SUSPENDED' ? t('btn_unblock') : t('btn_block')}
                        disabled={!canBlock}
                        onClick={() => blockToggle(user.email, user.status !== 'SUSPENDED')}
                      >
                        <Lock size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        className="h-10 text-slate-500 hover:text-white disabled:opacity-40"
                        title={t('btn_auth')}
                        disabled={!canAuth}
                        onClick={() => setModalAuthorityEmail(user.email)}
                      >
                        <ShieldCheck size={16} />
                      </Button>

                      {canRoleEdit ? (
                        <select
                          className="h-10 rounded-xl bg-[#0B101B] border border-white/10 px-3 text-xs text-slate-200 ml-2"
                          value={user.role}
                          onChange={(e) => changeRole(user.email, e.target.value as Role)}
                          title={t('btn_role')}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : null}

                      {user.status === 'PENDING' ? (
                        <>
                          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-black h-10 px-4 rounded-xl uppercase disabled:opacity-40 ml-2" disabled={!canApprove} onClick={() => setModalApproveEmail(user.email)}>
                            {t('btn_approve')}
                          </Button>
                          <Button className="bg-rose-600 hover:bg-rose-500 text-white font-black h-10 px-4 rounded-xl uppercase disabled:opacity-40" disabled={!canReject} onClick={() => setModalRejectEmail(user.email)}>
                            {t('btn_reject')}
                          </Button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAccounts.length === 0 ? <div className="p-10 text-center text-slate-600">{t('empty')}</div> : null}

          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <div className="text-xs text-slate-600 font-mono">
              {filteredAccounts.length} total • page {Math.min(page, totalPages)} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-10 text-slate-400 hover:text-white disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <Button variant="ghost" className="h-10 text-slate-400 hover:text-white disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Modal open={modalCreate} title={t('create_title')} onClose={() => setModalCreate(false)} widthClass="max-w-3xl">
        <CreateForm />
      </Modal>

      <Modal open={!!modalAudit} title={t('audit')} onClose={() => setModalAudit(false)} widthClass="max-w-3xl">
        <AuditModal />
      </Modal>

      <Modal open={!!modalProfileEmail} title={t('profile_title')} onClose={() => setModalProfileEmail(null)} widthClass="max-w-3xl">
        {modalProfileEmail ? <ProfileModal email={modalProfileEmail} /> : null}
      </Modal>

      <Modal open={!!modalAuthorityEmail} title={t('authority_title')} onClose={() => setModalAuthorityEmail(null)} widthClass="max-w-4xl">
        {modalAuthorityEmail ? <AuthorityModal email={modalAuthorityEmail} /> : null}
      </Modal>

      <Modal open={!!modalApproveEmail} title={t('approve_title')} onClose={() => setModalApproveEmail(null)} widthClass="max-w-2xl">
        {modalApproveEmail ? <ApproveRejectModal email={modalApproveEmail} mode="approve" /> : null}
      </Modal>

      <Modal open={!!modalRejectEmail} title={t('reject_title')} onClose={() => setModalRejectEmail(null)} widthClass="max-w-2xl">
        {modalRejectEmail ? <ApproveRejectModal email={modalRejectEmail} mode="reject" /> : null}
      </Modal>

      <Modal open={!!modalTokenEmail} title={t('token_title')} onClose={() => setModalTokenEmail(null)} widthClass="max-w-2xl">
        {modalTokenEmail ? <TokenModal email={modalTokenEmail} /> : null}
      </Modal>

      <Modal open={modalImport} title={t('import_title')} onClose={() => setModalImport(false)} widthClass="max-w-3xl">
        <ImportModal />
      </Modal>

      <Modal open={modalBulk} title={t('bulk_title')} onClose={() => setModalBulk(false)} widthClass="max-w-3xl">
        <BulkModal />
      </Modal>
    </div>
  );
}
