import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useLanguageContext } from "@/lib/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessPanel } from "@/types/roles";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/operations", en: "Operations", my: "လုပ်ငန်းလည်ပတ်မှု" , panel: "operations" as const },
  { to: "/warehouse",  en: "Warehouse",  my: "ဂိုဒေါင်" , panel: "warehouse" as const },
  { to: "/merchant",   en: "Merchant",   my: "ကုန်သည်" , panel: "merchant" as const },
  { to: "/tracking",   en: "Public Tracking", my: "အများပြည်သူ ခြေရာခံ" , panel: "public" as const },
];

export function AppShell() {
  const { t, language, setLanguage } = useLanguageContext();
  const { role, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900" />
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-900">Britium Express</div>
              <div className="text-xs text-slate-600">
                {t("Enterprise Portal", "လုပ်ငန်းသုံး ပေါ်တယ်")} {role ? `• ${role}` : ""}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setLanguage(language === "en" ? "my" : "en")}
            >
              {language === "en" ? "MY" : "EN"}
            </Button>
            <Button variant="ghost" onClick={signOut}>
              {t("Sign out", "ထွက်မည်")}
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3">
          <nav className="flex flex-wrap gap-2">
            {nav
              .filter((x) => canAccessPanel(role, x.panel))
              .map((x) => (
                <NavLink
                  key={x.to}
                  to={x.to}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2 text-sm font-semibold",
                      isActive ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100",
                    ].join(" ")
                  }
                >
                  {t(x.en, x.my)}
                </NavLink>
              ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
