import React, { useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { loadStore, getAccountByEmail, roleIsPrivileged, effectivePermissions, safeLower } from "@/lib/accountControlStore";
import { NAV_SECTIONS, type NavItem } from "@/lib/portalRegistry";
import { hasAnyPermission } from "@/lib/permissionResolver";

type Rule = { prefix: string; required?: string[] };

function collectRules(): Rule[] {
  const rules: Rule[] = [];

  const walk = (item: NavItem, inherited?: string[]) => {
    const req = (item.requiredPermissions && item.requiredPermissions.length ? item.requiredPermissions : inherited) ?? inherited;
    rules.push({ prefix: item.path, required: req });
    for (const c of item.children ?? []) walk(c, req);
  };

  for (const sec of NAV_SECTIONS) for (const it of sec.items) walk(it);

  rules.sort((a, b) => b.prefix.length - a.prefix.length);
  return rules;
}

function requiredForPath(pathname: string, rules: Rule[]): string[] | null {
  const p = pathname || "/";
  for (const r of rules) {
    if (!r.required || r.required.length === 0) continue;
    if (p === r.prefix) return r.required;
    if (p.startsWith(r.prefix.endsWith("/") ? r.prefix : r.prefix + "/")) return r.required;
  }
  return null;
}

export function RequireAuthz() {
  const auth = useAuth() as any;
  const loc = useLocation();

  const email = (auth?.user?.email ?? "") as string;
  const isAuthed = Boolean(auth?.user?.id || email);

  const rules = useMemo(() => collectRules(), []);
  const required = useMemo(() => requiredForPath(loc.pathname, rules), [loc.pathname, rules]);

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "NO_SESSION" }} />;
  }

  // Registry enforcement (NO SQL)
  const store = typeof window !== "undefined" ? loadStore() : null;
  const actor = store && email ? getAccountByEmail(store.accounts, email) : undefined;

  if (!actor) {
    return <Navigate to="/unauthorized" replace state={{ reason: "NOT_REGISTERED", detail: "User not in AccountControl registry" }} />;
  }

  if (actor.status !== "ACTIVE") {
    return <Navigate to="/unauthorized" replace state={{ reason: "NOT_ACTIVE", detail: `Account status: ${actor.status}` }} />;
  }

  // Privileged bypass
  if (roleIsPrivileged(actor.role) || roleIsPrivileged(auth?.role)) {
    return <Outlet />;
  }

  // Permission check (delegated perms + auth perms)
  if (required && required.length) {
    // Use hasAnyPermission resolver (already unions delegated perms) on auth shape.
    const ok = hasAnyPermission(auth, required);

    // Extra safety: if auth permissions missing, fall back to registry grants
    if (!ok && store) {
      const perms = effectivePermissions(store, actor);
      const requiredSet = new Set(required.map((x) => String(x)));
      let ok2 = false;
      for (const g of perms) if (requiredSet.has(String(g))) ok2 = true;
      if (!ok2) {
        return (
          <Navigate
            to="/unauthorized"
            replace
            state={{
              reason: "NO_PERMISSION",
              detail: `Missing required permissions for ${loc.pathname}: ${required.join(", ")}`,
            }}
          />
        );
      }
    } else if (!ok) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            reason: "NO_PERMISSION",
            detail: `Missing required permissions for ${loc.pathname}: ${required.join(", ")}`,
          }}
        />
      );
    }
  }

  return <Outlet />;
}
