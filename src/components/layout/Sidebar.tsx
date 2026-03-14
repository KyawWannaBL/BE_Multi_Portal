import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/app/navigation/navItems";
import { hasAny } from "@/lib/rbac";
import { useRbac } from "@/app/providers/RbacProvider";

export default function Sidebar() {
  const { userId, permissions } = useRbac();

  if (!userId) return null;

  const visible = NAV_ITEMS.filter((i) => !i.required || hasAny(permissions, i.required));

  return (
    <aside className="w-64 shrink-0 border-r border-gold-500/10 bg-navy-950/40 backdrop-blur hidden lg:block">
      <div className="p-4 text-sm font-semibold text-gold-300">Navigation</div>
      <nav className="px-2 pb-6">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "block px-3 py-2 rounded-lg text-sm transition",
                isActive
                  ? "bg-gold-500/15 text-gold-200"
                  : "text-gray-300 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
