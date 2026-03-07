import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { navForRole, type NavItem } from "@/lib/portalRegistry";

function Item({ item, depth = 0, onNavigate }: { item: NavItem; depth?: number; onNavigate?: () => void }) {
  const { lang } = useLanguage();
  const Icon = item.icon;

  return (
    <div className="space-y-1">
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-black tracking-widest uppercase transition",
            depth > 0 ? "ml-4 opacity-90" : "",
            isActive ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "text-slate-300 hover:bg-white/5",
          ].join(" ")
        }
      >
        <Icon className="h-4 w-4" />
        <span className="truncate">{lang === "en" ? item.label_en : item.label_mm}</span>
      </NavLink>

      {item.children?.length ? (
        <div className="space-y-1">
          {item.children.map((c) => (
            <Item key={c.id} item={c} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PortalSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { role } = useAuth();
  const { lang } = useLanguage();
  const sections = navForRole(role);

  const panel = (
    <aside className="w-72 shrink-0 rounded-2xl border border-white/10 bg-[#0B101B] p-4 h-[calc(100vh-96px)] overflow-auto">
      {sections.map((sec) => (
        <div key={sec.id} className="mb-6">
          <div className="text-[10px] font-mono text-slate-500 tracking-[0.25em] uppercase mb-3">
            {lang === "en" ? sec.title_en : sec.title_mm}
          </div>
          <div className="space-y-2">
            {sec.items.map((it) => (
              <Item key={it.id} item={it} onNavigate={onClose} />
            ))}
          </div>
        </div>
      ))}
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">{panel}</div>

      {/* Mobile Drawer */}
      {open ? (
        <div className="lg:hidden fixed inset-0 z-[999]">
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <div className="absolute left-3 top-20">{panel}</div>
        </div>
      ) : null}
    </>
  );
}
