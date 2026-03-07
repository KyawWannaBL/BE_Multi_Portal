import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { PortalShell } from "@/components/layout/PortalShell";
import { useLanguage } from "@/contexts/LanguageContext";

const linkBase =
  "block px-4 py-3 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-sm font-semibold";

export function ExecutionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { lang } = useLanguage();
  const t = useMemo(() => (lang === "en" ? "en" : "my"), [lang]);

  const items = useMemo(
    () => [
      { to: "/portal/execution", en: "Worklist", my: "လုပ်ငန်းစာရင်း" },
      { to: "/portal/execution/navigation", en: "Navigation", my: "လမ်းညွှန်" },
      { to: "/portal/execution/manual", en: "QR Manual", my: "QR လမ်းညွှန်" },
    ],
    []
  );

  return (
    <PortalShell title={title} links={[]}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 space-y-2 sticky top-[88px]">
            <div className="text-[10px] font-mono text-white/60 tracking-widest uppercase px-2 py-1">
              {t === "en" ? "Execution Menu" : "Execution မီနူး"}
            </div>
            {items.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-emerald-500/10 border-emerald-500/30" : ""}`
                }
              >
                {t === "en" ? i.en : i.my}
              </NavLink>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-9">{children}</section>
      </div>
    </PortalShell>
  );
}
