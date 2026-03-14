import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import LiveRiderMap from "@/components/maps/LiveRiderMap";
import toast from "react-hot-toast";
import {
  Users,
  ShieldAlert,
  Loader2,
  X,
  Activity,
  Database,
  Truck,
  User,
  ChevronLeft,
  ChevronRight,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight as ChevronRightSmall,
} from "lucide-react";
import {
  adminSidebarMenu,
  adminUtilityQuickLinks,
  labelFor,
  portalGroups,
} from "@/config/adminPortalMenu";
import { adminShellScreens } from "@/config/adminShellScreens";
import AdminShellPage from "./components/AdminShellPage";
import CreateDelivery from "@/pages/CreateDelivery";

const TopBar = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#0B101B]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg bg-white/5 p-2 text-gray-400 transition-all hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="rounded-lg bg-white/5 p-2 text-gray-400 transition-all hover:text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setLanguage(language === "en" ? "my" : "en")}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase text-gray-400 transition-all hover:text-white"
        >
          <Globe size={14} /> {language === "en" ? "MY" : "EN"}
        </button>

        <div className="mx-2 h-8 border-l border-white/10"></div>

        <div className="flex cursor-pointer items-center gap-3 rounded-xl p-1.5 transition-all hover:bg-white/5">
          <div className="hidden text-right md:block">
            <div className="text-xs font-bold uppercase tracking-tighter text-white">
              {labelFor(language, "menu.systemAdmin")}
            </div>
            <div className="font-mono text-[9px] text-emerald-400">SA-001</div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-emerald-500 to-blue-600">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = ({ t }: { t: (en: string, my: string) => string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("RIDER");

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: "Britium2026",
        options: { data: { full_name: fullName, role } },
      });

      if (authError) throw authError;

      toast.success(t("Identity Created! Default: Britium2026", "အကောင့်ဖန်တီးပြီးပါပြီ။"));
      setIsModalOpen(false);
      setEmail("");
      setFullName("");
      setRole("RIDER");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || t("Create failed", "ဖန်တီးမှု မအောင်မြင်ပါ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const callPostApi = async (url: string, body: any) => {
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
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data?.error || `Request failed: ${res.status}`);
    }

    return data;
  };

  const handleApprove = async (user: any) => {
    try {
      setLoadingId(user.id);
      await callPostApi("/api/admin/account-control/approve-account", {
        userId: user.id,
      });
      toast.success(t("Account approved", "အကောင့်အတည်ပြုပြီးပါပြီ"));
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || t("Approve failed", "အတည်ပြုမှု မအောင်မြင်ပါ"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleChangePassword = async (user: any) => {
    const newPassword = window.prompt(
      t("Enter new password", "စကားဝှက်အသစ် ထည့်ပါ"),
      ""
    );
    if (!newPassword) return;

    try {
      setLoadingId(user.id);
      await callPostApi("/api/admin/account-control/change-password", {
        userId: user.id,
        newPassword,
      });
      toast.success(t("Password changed successfully", "စကားဝှက်ပြောင်းပြီးပါပြီ"));
    } catch (error: any) {
      toast.error(
        error?.message || t("Password change failed", "စကားဝှက်ပြောင်းမှု မအောင်မြင်ပါ")
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetPassword = async (user: any) => {
    if (!user.email) {
      toast.error(t("User email not found", "အသုံးပြုသူ email မတွေ့ပါ"));
      return;
    }

    try {
      setLoadingId(user.id);
      await callPostApi("/api/admin/account-control/reset-password", {
        email: user.email,
      });
      toast.success(t("Reset password email sent", "Reset password email ပို့ပြီးပါပြီ"));
    } catch (error: any) {
      toast.error(error?.message || t("Reset failed", "Reset မအောင်မြင်ပါ"));
    } finally {
      setLoadingId(null);
    }
  };

  const handleBlockAccount = async (user: any) => {
    const nextBlocked = !user.is_blocked;

    try {
      setLoadingId(user.id);
      await callPostApi("/api/admin/account-control/block-account", {
        userId: user.id,
        block: nextBlocked,
      });
      toast.success(
        nextBlocked
          ? t("Account blocked", "အကောင့်ပိတ်ပြီးပါပြီ")
          : t("Account unblocked", "အကောင့်ပြန်ဖွင့်ပြီးပါပြီ")
      );
      await fetchUsers();
    } catch (error: any) {
      toast.error(
        error?.message || t("Block action failed", "အကောင့်ပိတ်/ဖွင့် မအောင်မြင်ပါ")
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteAccount = async (user: any) => {
    const ok = window.confirm(t("Delete this account?", "ဤအကောင့်ကို ဖျက်မလား?"));
    if (!ok) return;

    try {
      setLoadingId(user.id);
      await callPostApi("/api/admin/account-control/delete-account", {
        userId: user.id,
      });
      toast.success(t("Account deleted", "အကောင့်ဖျက်ပြီးပါပြီ"));
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || t("Delete failed", "ဖျက်မှု မအောင်မြင်ပါ"));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="animate-in fade-in relative p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white">
          {t("User Matrices", "အသုံးပြုသူများ")}
        </h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500"
        >
          <Users size={16} /> {t("CREATE IDENTITY", "အကောင့်သစ်")}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0A0E17] shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[9px] font-bold uppercase text-gray-500">
            <tr>
              <th className="p-4">{t("Staff Member", "ဝန်ထမ်း")}</th>
              <th className="p-4">{t("Role", "ရာထူး")}</th>
              <th className="p-4">{t("Status", "အခြေအနေ")}</th>
              <th className="p-4">{t("Actions", "လုပ်ဆောင်ချက်များ")}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-gray-300">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <Loader2 className="mx-auto animate-spin text-emerald-500" />
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{u.full_name || u.email}</td>
                  <td className="p-4 font-mono text-blue-400">{u.role}</td>
                  <td className="p-4 uppercase">
                    <span
                      className={
                        u.is_blocked
                          ? "text-rose-400"
                          : u.is_approved === false
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {u.is_blocked
                        ? t("BLOCKED", "ပိတ်ထားသည်")
                        : u.is_approved === false
                        ? t("PENDING", "စောင့်ဆိုင်းနေ")
                        : u.status || "ACTIVE"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {u.is_approved === false && !u.is_blocked ? (
                        <button
                          type="button"
                          disabled={loadingId === u.id}
                          onClick={() => handleApprove(u)}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase text-emerald-300 disabled:opacity-50"
                        >
                          {t("Approve", "အတည်ပြုရန်")}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        disabled={loadingId === u.id}
                        onClick={() => handleChangePassword(u)}
                        className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-[10px] font-black uppercase text-blue-300 disabled:opacity-50"
                      >
                        {t("Change Password", "စကားဝှက်ပြောင်းရန်")}
                      </button>

                      <button
                        type="button"
                        disabled={loadingId === u.id}
                        onClick={() => handleResetPassword(u)}
                        className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[10px] font-black uppercase text-amber-300 disabled:opacity-50"
                      >
                        {t("Reset Password", "စကားဝှက် Reset")}
                      </button>

                      <button
                        type="button"
                        disabled={loadingId === u.id}
                        onClick={() => handleBlockAccount(u)}
                        className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-[10px] font-black uppercase text-orange-300 disabled:opacity-50"
                      >
                        {u.is_blocked
                          ? t("Unblock Account", "အကောင့်ပြန်ဖွင့်ရန်")
                          : t("Block Account", "အကောင့်ပိတ်ရန်")}
                      </button>

                      <button
                        type="button"
                        disabled={loadingId === u.id}
                        onClick={() => handleDeleteAccount(u)}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase text-rose-300 disabled:opacity-50"
                      >
                        {t("Delete Account", "အကောင့်ဖျက်ရန်")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0B101B] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white">
                {t("Issue New Identity", "အကောင့်သစ်ဖန်တီးခြင်း")}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                placeholder={t("Full Name", "အမည်")}
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                placeholder={t("Email", "အီးမေးလ်")}
              />

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                <option value="RIDER">RIDER</option>
                <option value="MERCHANT">MERCHANT</option>
                <option value="FINANCE_ADMIN">FINANCE ADMIN</option>
              </select>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center text-[10px] font-bold uppercase text-amber-500">
                Default Password: Britium2026
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 py-4 text-xs font-black uppercase tracking-widest text-white"
              >
                {t("Authorize", "အတည်ပြုမည်")}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const CommandCenter = ({ t }: { t: (en: string, my: string) => string }) => (
  <div className="animate-in fade-in duration-500 p-6 md:p-8">
    <div className="mb-8">
      <h2 className="mb-1 text-2xl font-black uppercase tracking-widest text-white">
        {t("Command Center", "ထိန်းချုပ်ရေးစင်တာ")}
      </h2>
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
        {t("System Online", "စနစ်အလုပ်လုပ်နေသည်")}
      </p>
    </div>

    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
      {[
        { title: t("Nodes", "နေရာများ"), val: "12", icon: <Activity className="text-blue-500" /> },
        { title: t("Users", "အသုံးပြုသူ"), val: "142", icon: <Users className="text-purple-500" /> },
        { title: t("Cargo", "ကုန်ပစ္စည်း"), val: "842", icon: <Truck className="text-emerald-500" /> },
        { title: t("DB", "ဒေတာ"), val: "99.9%", icon: <Database className="text-amber-500" /> },
      ].map((stat, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/5 bg-[#0A0E17] p-6 transition-all hover:border-white/10"
        >
          <div className="mb-4">{stat.icon}</div>
          <div className="text-3xl font-black text-white">{stat.val}</div>
          <div className="mt-2 text-[10px] font-bold uppercase text-gray-500">
            {stat.title}
          </div>
        </div>
      ))}
    </div>

    <div className="relative z-0 h-[450px] w-full overflow-hidden rounded-2xl border border-white/5 bg-black shadow-2xl">
      <LiveRiderMap />
    </div>
  </div>
);

function SidebarNode({
  node,
  language,
  location,
  expandedGroups,
  toggleGroup,
}: {
  node: any;
  language: string;
  location: ReturnType<typeof useLocation>;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (key: string) => void;
}) {
  const Icon = node.icon;

  if (node.children && node.children.length) {
    const open = expandedGroups[node.key] ?? true;
    const childActive = node.children.some(
      (child: any) => child.path && location.pathname.startsWith(child.path)
    );

    return (
      <div className="mb-2">
        <button
          type="button"
          onClick={() => toggleGroup(node.key)}
          className={`w-full rounded-xl px-4 py-3 text-[10px] font-black uppercase transition-all ${
            childActive
              ? "border border-emerald-500/20 bg-emerald-600/10 text-emerald-400"
              : "text-gray-500 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon ? <Icon size={16} /> : null}
              <span>{labelFor(language, node.labelKey)}</span>
            </div>
            {open ? <ChevronDown size={14} /> : <ChevronRightSmall size={14} />}
          </div>
        </button>

        {open ? (
          <div className="mt-2 ml-4 space-y-1 border-l border-white/5 pl-3">
            {node.children.map((child: any) => (
              <Link
                key={child.key}
                to={child.path || "/portal/admin"}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase transition-all ${
                  child.path === location.pathname
                    ? "bg-white/5 text-emerald-400"
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{labelFor(language, child.labelKey)}</span>
                <ExternalLink size={11} className="opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      to={node.path || "/portal/admin"}
      className={`mb-3 flex items-center gap-4 rounded-xl px-4 py-3.5 text-xs font-black uppercase transition-all ${
        node.path === location.pathname
          ? "border border-emerald-500/20 bg-emerald-600/10 text-emerald-400"
          : "text-gray-500 hover:bg-white/5 hover:text-white"
      }`}
    >
      {Icon ? <Icon size={18} /> : null}
      <span>{labelFor(language, node.labelKey)}</span>
    </Link>
  );
}

export default function SuperAdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const t = (en: string, my: string) => (language === "en" ? en : my);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    wayManagement: true,
    merchants: false,
    deliverymen: false,
    accounting: false,
    reporting: false,
    broadcastMessage: false,
    teams: false,
    contacts: false,
    settings: false,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const shellRoutes = useMemo(() => Object.entries(adminShellScreens), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#05080F] font-sans text-slate-200">
      <div className="z-50 flex w-80 flex-col justify-between border-r border-white/5 bg-[#0A0E17]">
        <div className="custom-scrollbar overflow-y-auto">
          <div className="flex items-center gap-3 border-b border-white/5 p-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/20">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-sm font-black uppercase leading-tight tracking-widest text-white">
              Britium
              <br />
              <span className="text-[10px] text-emerald-500">Terminal</span>
            </span>
          </div>

          <nav className="px-6 py-6">
            {adminSidebarMenu.map((node) => (
              <SidebarNode
                key={node.key}
                node={node}
                language={language}
                location={location}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
              />
            ))}

            <div className="mt-8 mb-6">
              <div className="mb-2 ml-2 text-[9px] font-black uppercase tracking-widest text-gray-600">
                {labelFor(language, "menu.userMatrix")}
              </div>

              {adminUtilityQuickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`mb-2 flex items-center gap-4 rounded-xl px-4 py-3 text-[10px] font-black uppercase transition-all ${
                      item.path === location.pathname
                        ? "border border-emerald-500/20 bg-emerald-600/10 text-emerald-400"
                        : "text-gray-500 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{labelFor(language, item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>

            {portalGroups.map((group) => (
              <div key={group.key} className="mb-6">
                <div className="mb-2 ml-2 text-[9px] font-black uppercase tracking-widest text-gray-600">
                  {labelFor(language, group.labelKey)}
                </div>

                {group.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.key}
                      to={link.path}
                      className="group flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase text-gray-500 transition-all hover:text-white"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={13} />
                        <span>{labelFor(language, link.labelKey)}</span>
                      </div>
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="space-y-3 p-6">
          <button
            onClick={() => setLanguage(language === "en" ? "my" : "en")}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase text-white transition-all hover:bg-white/10"
          >
            <Globe size={14} /> {language === "en" ? "MY" : "EN"}
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-500/10 bg-rose-500/5 py-4 text-[10px] font-black uppercase text-rose-500 transition-all hover:bg-rose-500/20"
          >
            <ShieldAlert size={14} /> {labelFor(language, "menu.logOut")}
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-y-auto bg-gradient-to-tr from-black to-[#05080F]">
          <Routes>
            <Route path="/" element={<CommandCenter t={t} />} />
            <Route path="users" element={<UserManagement t={t} />} />

            <Route path="create-delivery" element={<CreateDelivery />} />

            <Route
              path="merchants"
              element={
                <AdminShellPage
                  config={{
                    titleEn: "Merchant Admin",
                    titleMy: "ကုန်သည် စီမံခန့်ခွဲမှု",
                    descriptionEn: "Legacy merchant admin screen preserved as a shell.",
                    descriptionMy: "ရှိပြီးသား merchant admin screen ကို shell အဖြစ် ထိန်းသိမ်းထားပါသည်။",
                    endpoint: "/api/admin/merchants",
                    filters: ["merchant", "status"],
                    columns: [
                      { key: "merchantCode", labelEn: "Merchant Code", labelMy: "ကုန်သည်ကုဒ်" },
                      { key: "merchantName", labelEn: "Merchant Name", labelMy: "ကုန်သည်အမည်" },
                      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" },
                    ],
                  }}
                />
              }
            />

            <Route
              path="settings"
              element={
                <AdminShellPage
                  config={{
                    titleEn: "Platform Settings",
                    titleMy: "ပလက်ဖောင်း ဆက်တင်များ",
                    descriptionEn: "Legacy settings screen preserved as a shell.",
                    descriptionMy: "ရှိပြီးသား settings screen ကို shell အဖြစ် ထိန်းသိမ်းထားပါသည်။",
                    endpoint: "/api/admin/settings",
                    filters: ["module", "status"],
                    columns: [
                      { key: "module", labelEn: "Module", labelMy: "မော်ဂျူး" },
                      { key: "value", labelEn: "Value", labelMy: "တန်ဖိုး" },
                      { key: "status", labelEn: "Status", labelMy: "အခြေအနေ" },
                    ],
                  }}
                />
              }
            />

            {shellRoutes
              .filter(([fullPath]) => fullPath !== "/portal/admin/create-delivery")
              .map(([fullPath, config]) => {
                const relativePath = fullPath.replace("/portal/admin/", "");
                return (
                  <Route
                    key={fullPath}
                    path={relativePath}
                    element={<AdminShellPage config={config as any} />}
                  />
                );
              })}
          </Routes>
        </div>
      </div>
    </div>
  );
}