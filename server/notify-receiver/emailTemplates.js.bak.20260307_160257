export function subjectFor(event, payload) {
  const e = String(event || "EVENT");
  if (e === "ACCOUNT_REQUEST_CREATED") return `Account Request Created: ${payload?.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_APPROVED") return `Account Approved: ${payload?.email ?? ""}`.trim();
  if (e === "ACCOUNT_REQUEST_REJECTED") return `Account Rejected: ${payload?.email ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_CREATED") return `Authority Request Created: ${payload?.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_APPROVED") return `Authority Request Approved: ${payload?.req?.subjectEmail ?? payload?.subjectEmail ?? ""}`.trim();
  if (e === "AUTHORITY_REQUEST_REJECTED") return `Authority Request Rejected: ${payload?.req?.subjectEmail ?? payload?.subjectEmail ?? ""}`.trim();
  return `Notification: ${e}`;
}

export function htmlFor(event, body) {
  const { at, actorEmail, payload } = body;
  const pretty = escapeHtml(JSON.stringify(payload ?? {}, null, 2));

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system; line-height: 1.4">
    <h2 style="margin:0 0 8px 0;">${escapeHtml(String(event))}</h2>
    <p style="margin:0 0 8px 0;"><b>Time:</b> ${escapeHtml(String(at ?? ""))}</p>
    <p style="margin:0 0 16px 0;"><b>Actor:</b> ${escapeHtml(String(actorEmail ?? ""))}</p>
    <div style="padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
      <pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;">${pretty}</pre>
    </div>
    <p style="margin:16px 0 0 0;color:#6b7280;font-size:12px;">
      BE Multi Portal • Notify Receiver
    </p>
  </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
