function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function portalLabel(portalKey) {
  const k = String(portalKey || "").toUpperCase();
  if (k === "FINANCE") return { en: "Finance Portal", mm: "ငွေစာရင်း Portal" };
  if (k === "HR") return { en: "HR Portal", mm: "HR Portal" };
  if (k === "OPERATIONS") return { en: "Operations Portal", mm: "လုပ်ငန်းလည်ပတ်မှု Portal" };
  if (k === "EXECUTION") return { en: "Execution Portal", mm: "Execution Portal" };
  if (k === "WAREHOUSE") return { en: "Warehouse Portal", mm: "Warehouse Portal" };
  if (k === "BRANCH") return { en: "Branch Portal", mm: "Branch Portal" };
  if (k === "SUPPORT") return { en: "Support Portal", mm: "Support Portal" };
  if (k === "SUPERVISOR") return { en: "Supervisor Portal", mm: "Supervisor Portal" };
  if (k === "MARKETING") return { en: "Marketing Portal", mm: "Marketing Portal" };
  if (k === "ADMIN") return { en: "Super Admin", mm: "Super Admin" };
  return { en: "Platform", mm: "Platform" };
}

function detectPortal(payload = {}) {
  // From permission
  const perm = String(payload.permission ?? payload?.req?.permission ?? "").toUpperCase();
  const role = String(payload.role ?? "").toUpperCase();
  const portalDefaults = Array.isArray(payload.portalDefaults) ? payload.portalDefaults.map((x) => String(x).toUpperCase()) : [];

  const hay = [perm, role, ...portalDefaults].join(" ");
  if (hay.includes("PORTAL_FINANCE") || hay.includes("FINANCE")) return "FINANCE";
  if (hay.includes("PORTAL_HR") || hay.includes("HR")) return "HR";
  if (hay.includes("PORTAL_EXECUTION") || hay.includes("RIDER") || hay.includes("DRIVER") || hay.includes("EXECUTION")) return "EXECUTION";
  if (hay.includes("PORTAL_WAREHOUSE") || hay.includes("WAREHOUSE")) return "WAREHOUSE";
  if (hay.includes("PORTAL_BRANCH") || hay.includes("BRANCH")) return "BRANCH";
  if (hay.includes("PORTAL_SUPPORT") || hay.includes("SUPPORT") || hay.includes("CUSTOMER_SERVICE")) return "SUPPORT";
  if (hay.includes("PORTAL_SUPERVISOR") || hay.includes("SUPERVISOR")) return "SUPERVISOR";
  if (hay.includes("PORTAL_MARKETING") || hay.includes("MARKETING")) return "MARKETING";
  if (hay.includes("ADMIN_PORTAL_READ") || hay.includes("SUPER_ADMIN")) return "ADMIN";
  if (hay.includes("PORTAL_OPERATIONS") || hay.includes("OPERATIONS") || hay.includes("ADMIN") || hay.includes("MGR")) return "OPERATIONS";
  return "PLATFORM";
}

export function subjectFor(event, payload) {
  const e = String(event || "EVENT");
  const p = payload || {};
  const portal = detectPortal(p);
  const pl = portalLabel(portal).en;

  if (e === "ACCOUNT_REQUEST_CREATED") return `[${pl}] Account Request Created: ${p.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_APPROVED") return `[${pl}] Account Approved: ${p.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_REJECTED") return `[${pl}] Account Rejected: ${p.email ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_CREATED") return `[${pl}] Authority Request Created: ${p.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_APPROVED") return `[${pl}] Authority Request Approved: ${p?.req?.subjectEmail ?? p.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_REJECTED") return `[${pl}] Authority Request Rejected: ${p?.req?.subjectEmail ?? p.subjectEmail ?? ""}`.trim();
  return `[${pl}] Notification: ${e}`;
}

function link(baseUrl, path, params = {}) {
  const base = String(baseUrl || "").replace(/\/+$/, "");
  const p = String(path || "").startsWith("/") ? path : "/" + path;
  const url = new URL(base + p);

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

function actionLinks(appBaseUrl, event, payload) {
  const p = payload || {};
  const requestId = p.requestId ?? p?.req?.id ?? null;
  const email = p.email ?? p.subjectEmail ?? p?.req?.subjectEmail ?? null;

  const links = [];

  // review requests (super admins)
  links.push({
    label: "Review Authority Requests",
    url: link(appBaseUrl, "/portal/admin/accounts", { tab: "AUTH_REQUESTS", status: "PENDING" }),
  });

  if (requestId) {
    links.push({
      label: "Open This Request",
      url: link(appBaseUrl, "/portal/admin/accounts", { tab: "AUTH_REQUESTS", requestId }),
    });
  }

  if (email) {
    links.push({
      label: "Open Account",
      url: link(appBaseUrl, "/portal/admin/accounts", { tab: "ACCOUNTS", email }),
    });
  }

  return links;
}

function portalHeader(portalKey) {
  const pl = portalLabel(portalKey);
  return `
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
      <div>
        <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#64748b;">${esc(pl.en)} • ${esc(pl.mm)}</div>
        <div style="font-size:26px;font-weight:900;color:#0f172a;margin-top:6px;">Security Notification</div>
      </div>
      <div style="padding:10px 12px;border-radius:14px;border:1px solid #e2e8f0;background:#ffffff;">
        <div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#64748b;">BE Multi Portal</div>
        <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:2px;">Notify</div>
      </div>
    </div>
  `;
}

function kv(label, value) {
  return `
    <div style="display:flex;gap:10px;align-items:baseline;margin:2px 0;">
      <div style="width:110px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.12em;">${esc(label)}</div>
      <div style="color:#0f172a;font-size:13px;font-weight:700;">${esc(value)}</div>
    </div>
  `;
}

function portalSpecificBody(portal, event, payload) {
  const p = payload || {};
  const e = String(event || "");

  if (e.startsWith("ACCOUNT_REQUEST_")) {
    const defaults = [
      ...(Array.isArray(p.portalDefaults) ? p.portalDefaults : []),
      ...(Array.isArray(p.govDefaults) ? p.govDefaults : []),
    ].map(String);
    const defaultsText = defaults.length ? defaults.join(", ") : "—";

    return `
      <div style="margin-top:14px;padding:14px;border-radius:16px;border:1px solid #e2e8f0;background:#f8fafc;">
        <div style="font-size:12px;color:#334155;font-weight:900;letter-spacing:.14em;text-transform:uppercase;">Account Event</div>
        <div style="margin-top:10px;">
          ${kv("Email", p.email ?? "—")}
          ${kv("Role", p.role ?? "—")}
          ${kv("Defaults", defaultsText)}
          ${kv("Note", p.note ?? "—")}
        </div>
      </div>
    `;
  }

  if (e.startsWith("AUTHORITY_REQUEST_") || e.startsWith("AUTHORITY_")) {
    const req = p.req ?? {};
    return `
      <div style="margin-top:14px;padding:14px;border-radius:16px;border:1px solid #e2e8f0;background:#f8fafc;">
        <div style="font-size:12px;color:#334155;font-weight:900;letter-spacing:.14em;text-transform:uppercase;">Authority Event</div>
        <div style="margin-top:10px;">
          ${kv("Request ID", p.requestId ?? req.id ?? "—")}
          ${kv("Subject", p.subjectEmail ?? req.subjectEmail ?? "—")}
          ${kv("Type", p.type ?? req.type ?? "—")}
          ${kv("Permission", p.permission ?? req.permission ?? "—")}
          ${kv("Requested By", p.requestedBy ?? req.requestedBy ?? "—")}
          ${kv("Note", p.note ?? p.decisionNote ?? req.requestNote ?? "—")}
        </div>
      </div>
    `;
  }

  return `
    <div style="margin-top:14px;padding:14px;border-radius:16px;border:1px solid #e2e8f0;background:#f8fafc;">
      <div style="font-size:12px;color:#334155;font-weight:900;letter-spacing:.14em;text-transform:uppercase;">Event Payload</div>
      <pre style="margin:10px 0 0 0;white-space:pre-wrap;word-wrap:break-word;color:#0f172a;">${esc(JSON.stringify(p, null, 2))}</pre>
    </div>
  `;
}

export function htmlFor(event, body, serverBaseUrlForLinks) {
  const { at, actorEmail, payload } = body;
  const portal = detectPortal(payload);
  const links = actionLinks(serverBaseUrlForLinks, event, payload);

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height: 1.45; padding: 16px; background:#f1f5f9;">
    <div style="max-width:860px;margin:0 auto;background:white;border-radius:22px;border:1px solid #e2e8f0;padding:18px;">
      ${portalHeader(portal)}

      <div style="margin-top:12px;padding:14px;border-radius:16px;border:1px solid #e2e8f0;background:#ffffff;">
        ${kv("Event", event)}
        ${kv("Time", at ?? "—")}
        ${kv("Actor", actorEmail ?? "—")}
      </div>

      ${portalSpecificBody(portal, event, payload)}

      <div style="margin-top:14px;padding:14px;border-radius:16px;border:1px solid #e2e8f0;background:#ffffff;">
        <div style="font-size:12px;color:#334155;font-weight:900;letter-spacing:.14em;text-transform:uppercase;">Actions</div>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px;">
          ${links
            .map(
              (l) => `
              <a href="${esc(l.url)}" style="display:inline-block;padding:10px 12px;border-radius:14px;border:1px solid #cbd5e1;background:#0b1220;color:#e2e8f0;text-decoration:none;font-weight:800;font-size:12px;">
                ${esc(l.label)}
              </a>`
            )
            .join("")}
        </div>
        <div style="margin-top:10px;color:#64748b;font-size:12px;">
          EN: Links open the platform page (final approval requires privileged login).<br/>
          MM: Link များက platform စာမျက်နှာကိုဖွင့်ပေးပြီး အတည်ပြုရန် privileged login လိုအပ်ပါသည်။
        </div>
      </div>

      <div style="margin-top:14px;color:#64748b;font-size:12px;">
        BE Multi Portal • Notify Receiver • v1.1
      </div>
    </div>
  </div>
  `;
}
