import React, { useEffect, useMemo, useState } from "react";
import {
  CheckSquare,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Square
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getJson, patchJson } from "@/features/admin-shell/api/http";
import { PRIVILEGE_GROUPS } from "@/features/auth/privileges";

function normalizeCode(code: string) {
  return String(code || "").trim().toLowerCase();
}

export default function UserAuthorizationSettingsPage() {
  const { language, bi } = useLanguage();

  const [roles, setRoles] = useState<any[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string>("");
  const [activeRoleName, setActiveRoleName] = useState<string>("");
  const [assignedCodes, setAssignedCodes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);
  const [saving, setSaving] = useState(false);

  const assignedSet = useMemo(
    () => new Set(assignedCodes.map(normalizeCode)),
    [assignedCodes]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PRIVILEGE_GROUPS;

    return PRIVILEGE_GROUPS
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.code.toLowerCase().includes(q) ||
            item.labelEn.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  async function loadRoles() {
    try {
      setLoadingRoles(true);
      const result = await getJson("/api/admin/user-role-list-by-privileges", {
        page: 1,
        pageSize: 500,
        sortBy: "name",
        sortOrder: "asc",
      });

      const items = Array.isArray(result?.items) ? result.items : [];
      setRoles(items);

      if (!activeRoleId && items[0]?.id) {
        setActiveRoleId(String(items[0].id));
        setActiveRoleName(String(items[0].name || items[0].role_name || ""));
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : bi("Failed to load roles.", "Role များကို မရယူနိုင်ပါ။")
      );
    } finally {
      setLoadingRoles(false);
    }
  }

  async function loadRolePrivileges(roleId: string) {
    if (!roleId) return;

    try {
      setLoadingPrivileges(true);

      const result = await getJson("/api/admin/user-role-privileges", {
        roleId,
      });

      const items = Array.isArray(result?.items) ? result.items : [];
      const nextCodes = items
        .map((item: any) => item.code || item.privilege_code || item.privilegeCode)
        .filter(Boolean)
        .map(normalizeCode);

      setAssignedCodes(nextCodes);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : bi("Failed to load privileges.", "Privilege များကို မရယူနိုင်ပါ။")
      );
      setAssignedCodes([]);
    } finally {
      setLoadingPrivileges(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (activeRoleId) {
      const role = roles.find((r) => String(r.id) === String(activeRoleId));
      setActiveRoleName(String(role?.name || role?.role_name || ""));
      loadRolePrivileges(activeRoleId);
    }
  }, [activeRoleId]);

  function toggleCode(code: string) {
    const normalized = normalizeCode(code);
    setAssignedCodes((prev) =>
      prev.includes(normalized)
        ? prev.filter((x) => x !== normalized)
        : [...prev, normalized]
    );
  }

  function toggleGroup(codes: string[]) {
    const normalized = codes.map(normalizeCode);
    const allChecked = normalized.every((code) => assignedSet.has(code));

    setAssignedCodes((prev) => {
      const current = new Set(prev.map(normalizeCode));

      if (allChecked) {
        normalized.forEach((code) => current.delete(code));
      } else {
        normalized.forEach((code) => current.add(code));
      }

      return Array.from(current);
    });
  }

  async function savePrivileges() {
    if (!activeRoleId) {
      toast.error(bi("Please select a role first.", "အရင်ဆုံး role တစ်ခုရွေးပါ။"));
      return;
    }

    try {
      setSaving(true);

      await patchJson("/api/admin/user-role-privileges-update", {
        roleId: activeRoleId,
        privilegeCodes: assignedCodes,
      });

      toast.success(
        bi("Privileges updated successfully.", "Privilege များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။")
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : bi("Failed to save privileges.", "Privilege များကို မသိမ်းနိုင်ပါ။")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-white">
            {bi("User Authorization Settings", "အသုံးပြုသူ ခွင့်ပြုချက် သတ်မှတ်ခြင်း")}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {bi(
              "Manage role-based privileges for every module and action.",
              "Module နှင့် action တိုင်းအတွက် role-based privilege များကို စီမံရန်။"
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadRoles}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase text-white hover:bg-white/10"
          >
            <RefreshCw size={14} />
            {bi("Refresh", "ပြန်လည်ရယူရန်")}
          </button>

          <button
            type="button"
            onClick={savePrivileges}
            disabled={saving || !activeRoleId}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            <Save size={14} />
            {saving ? bi("Saving...", "သိမ်းနေသည်...") : bi("Save Privileges", "Privilege များ သိမ်းရန်")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-white/5 bg-[#0A0E17] overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
            {bi("Roles", "Role များ")}
          </div>

          {loadingRoles ? (
            <div className="p-6 text-sm text-gray-400">{bi("Loading roles...", "Role များ ဖွင့်နေသည်...")}</div>
          ) : !roles.length ? (
            <div className="p-6 text-sm text-gray-400">{bi("No roles found.", "Role မတွေ့ပါ။")}</div>
          ) : (
            <div className="max-h-[70vh] overflow-auto p-3">
              <div className="space-y-2">
                {roles.map((role) => {
                  const id = String(role.id);
                  const name = String(role.name || role.role_name || `ROLE-${id}`);
                  const active = id === activeRoleId;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setActiveRoleId(id);
                        setActiveRoleName(name);
                      }}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-white/5 bg-black/20 text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} />
                        <span className="text-sm font-bold">{name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0A0E17] overflow-hidden">
          <div className="border-b border-white/5 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {bi("Selected Role", "ရွေးထားသော Role")}
                </div>
                <div className="mt-2 text-lg font-black text-white">
                  {activeRoleName || "-"}
                </div>
              </div>

              <div className="relative w-full max-w-md">
                <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={bi("Search privilege code or label", "Privilege code သို့ label ရှာရန်")}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {loadingPrivileges ? (
            <div className="p-6 text-sm text-gray-400">{bi("Loading privileges...", "Privilege များ ဖွင့်နေသည်...")}</div>
          ) : (
            <div className="max-h-[70vh] overflow-auto p-5">
              <div className="space-y-5">
                {filteredGroups.map((group) => {
                  const groupCodes = group.items.map((item) => item.code);
                  const allChecked = groupCodes.every((code) => assignedSet.has(normalizeCode(code)));

                  return (
                    <div key={group.module} className="rounded-2xl border border-white/5 bg-black/20 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                        <div className="text-sm font-black uppercase tracking-wider text-white">
                          {group.module}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleGroup(groupCodes)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase text-white hover:bg-white/10"
                        >
                          {allChecked ? <CheckSquare size={12} /> : <Square size={12} />}
                          {allChecked ? bi("Uncheck Group", "အုပ်စုဖြုတ်ရန်") : bi("Check Group", "အုပ်စုရွေးရန်")}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
                        {group.items.map((item) => {
                          const checked = assignedSet.has(normalizeCode(item.code));

                          return (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => toggleCode(item.code)}
                              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                checked
                                  ? "border-emerald-500/30 bg-emerald-500/10"
                                  : "border-white/5 bg-[#0A0E17] hover:bg-white/5"
                              }`}
                            >
                              <div className="pt-0.5">
                                {checked ? (
                                  <CheckSquare size={16} className="text-emerald-400" />
                                ) : (
                                  <Square size={16} className="text-gray-500" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white break-words">
                                  {language === "en" ? item.labelEn : item.labelMy}
                                </div>
                                <div className="mt-1 text-[11px] font-mono text-emerald-300 break-all">
                                  {item.code}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {!filteredGroups.length ? (
                  <div className="rounded-2xl border border-white/5 bg-black/20 p-6 text-sm text-gray-400">
                    {bi("No privileges match your search.", "ရှာဖွေမှုနှင့် ကိုက်ညီသော privilege မရှိပါ။")}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
