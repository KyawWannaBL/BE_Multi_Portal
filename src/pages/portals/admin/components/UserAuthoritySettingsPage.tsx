import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Save, ShieldCheck, Users, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ROLE_OPTIONS = [
  "SUPER_ADMIN",
  "APP_OWNER",
  "FINANCE_ADMIN",
  "FINANCE",
  "ACCOUNTANT",
  "OPERATIONS_ADMIN",
  "SUPERVISOR",
  "RIDER",
  "MERCHANT",
  "STAFF"
];

async function getJson(url: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!res.ok) throw new Error(data?.error || `GET failed: ${res.status}`);
  return data;
}

async function postJson(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  const data = raw ? JSON.parse(raw) : {};
  if (!res.ok) throw new Error(data?.error || `POST failed: ${res.status}`);
  return data;
}

export default function UserAuthoritySettingsPage() {
  const { language } = useLanguage();
  const t = (en: string, my: string) => (language === "en" ? en : my);

  const [permissions, setPermissions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roleAuthorities, setRoleAuthorities] = useState<Record<string, boolean>>({});
  const [userAuthorities, setUserAuthorities] = useState<Record<string, boolean>>({});
  const [selectedRole, setSelectedRole] = useState("SUPER_ADMIN");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"role" | "user">("role");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const result = await getJson(`/api/admin/authority-settings/list?role=${encodeURIComponent(selectedRole)}&userId=${encodeURIComponent(selectedUserId || "")}`);
      setPermissions(result.permissions || []);
      setProfiles(result.profiles || []);
      setRoleAuthorities(result.roleAuthorities || {});
      setUserAuthorities(result.userAuthorities || {});
    } catch (error: any) {
      toast.error(error?.message || t("Could not load authority settings", "Authority settings မဖွင့်နိုင်ပါ"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedRole, selectedUserId]);

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = (permissions || []).filter((p) => {
      const en = String(p.label_en || "").toLowerCase();
      const my = String(p.label_my || "").toLowerCase();
      const key = String(p.permission_key || "").toLowerCase();
      const grp = String(p.permission_group || "").toLowerCase();
      return !q || en.includes(q) || my.includes(q) || key.includes(q) || grp.includes(q);
    });

    return filtered.reduce((acc: Record<string, any[]>, item) => {
      const group = item.permission_group || "General";
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    }, {});
  }, [permissions, search]);

  const currentMap = mode === "role" ? roleAuthorities : userAuthorities;
  const setCurrentMap = mode === "role" ? setRoleAuthorities : setUserAuthorities;

  const togglePermission = (permissionKey: string) => {
    setCurrentMap((prev: Record<string, boolean>) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  const setGroupPermissions = (groupItems: any[], value: boolean) => {
    setCurrentMap((prev: Record<string, boolean>) => {
      const next = { ...prev };
      groupItems.forEach((item) => {
        next[item.permission_key] = value;
      });
      return next;
    });
  };

  const saveAuthorities = async () => {
    try {
      setSaving(true);

      if (mode === "role") {
        await postJson("/api/admin/authority-settings/save-role", {
          role: selectedRole,
          permissions: roleAuthorities,
        });
      } else {
        if (!selectedUserId) {
          toast.error(t("Please select a user first", "အသုံးပြုသူကို အရင်ရွေးပါ"));
          return;
        }
        await postJson("/api/admin/authority-settings/save-user", {
          userId: selectedUserId,
          permissions: userAuthorities,
        });
      }

      toast.success(t("Authority settings saved", "Authority settings သိမ်းပြီးပါပြီ"));
    } catch (error: any) {
      toast.error(error?.message || t("Save failed", "သိမ်းဆည်းမှု မအောင်မြင်ပါ"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            {t("User Authority Settings", "အသုံးပြုသူ အခွင့်အာဏာ ဆက်တင်များ")}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {t(
              "Manage permissions by role or dedicated person.",
              "Role အလိုက် သို့မဟုတ် သတ်မှတ်ထားသော လူတစ်ဦးချင်းအလိုက် permission များကို စီမံပါ။"
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white hover:bg-white/10"
          >
            <RefreshCw size={14} />
            {t("Refresh", "ပြန်ဖွင့်ရန်")}
          </button>

          <button
            type="button"
            onClick={saveAuthorities}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? t("Saving...", "သိမ်းနေသည်...") : t("Save Authority", "Authority သိမ်းရန်")}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setMode("role")}
          className={`rounded-2xl border px-4 py-4 text-left ${mode === "role" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-[#0A0E17] text-white"}`}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase">
            <ShieldCheck size={14} />
            {t("Role Authority", "Role အခွင့်အာဏာ")}
          </div>
          <div className="mt-2 text-sm text-gray-400">{t("Apply permissions to an entire role", "Role တစ်ခုလုံးအတွက် permissions သတ်မှတ်ရန်")}</div>
        </button>

        <button
          type="button"
          onClick={() => setMode("user")}
          className={`rounded-2xl border px-4 py-4 text-left ${mode === "user" ? "border-blue-500/20 bg-blue-500/10 text-blue-300" : "border-white/10 bg-[#0A0E17] text-white"}`}
        >
          <div className="flex items-center gap-2 text-xs font-black uppercase">
            <Users size={14} />
            {t("Dedicated Person Override", "လူတစ်ဦးချင်း override")}
          </div>
          <div className="mt-2 text-sm text-gray-400">{t("Apply permissions to a specific person", "အသုံးပြုသူ တစ်ဦးချင်းကို permissions သတ်မှတ်ရန်")}</div>
        </button>

        <div className="rounded-2xl border border-white/10 bg-[#0A0E17] p-4 xl:col-span-2">
          {mode === "role" ? (
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {t("Select Role", "Role ရွေးချယ်ရန်")}
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {t("Select Person", "အသုံးပြုသူ ရွေးချယ်ရန်")}
              </div>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">{t("Choose user", "အသုံးပြုသူ ရွေးပါ")}</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email || p.id} ({p.role || "USER"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-[#0A0E17] p-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Search permissions...", "Permission များရှာရန်...")}
            className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#0A0E17] p-10 text-center text-sm text-gray-400">
          {t("Loading authority settings...", "Authority settings ဖွင့်နေသည်...")}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, items]) => {
            const allChecked = items.length > 0 && items.every((x) => currentMap[x.permission_key]);
            const someChecked = items.some((x) => currentMap[x.permission_key]);

            return (
              <div key={group} className="rounded-2xl border border-white/10 bg-[#0A0E17] p-5">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest text-white">{group}</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {items.length} {t("permissions", "permissions")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupPermissions(items, true)}
                      className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase ${allChecked ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white hover:bg-white/10"}`}
                    >
                      {t("Select All", "အားလုံးရွေးရန်")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupPermissions(items, false)}
                      className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase ${!someChecked ? "bg-rose-500/20 text-rose-300" : "bg-white/5 text-white hover:bg-white/10"}`}
                    >
                      {t("Clear All", "အားလုံးဖြုတ်ရန်")}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const checked = Boolean(currentMap[item.permission_key]);
                    return (
                      <label
                        key={item.permission_key}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${checked ? "border-emerald-500/20 bg-emerald-500/10" : "border-white/10 bg-black/20 hover:bg-white/5"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(item.permission_key)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">
                            {language === "en" ? item.label_en : item.label_my}
                          </div>
                          <div className="mt-1 text-[11px] text-gray-500">{item.permission_key}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
