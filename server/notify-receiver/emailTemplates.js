export function subjectFor(event, payload) {
  return `[BE Multi Portal] ${event}: ${payload?.email || payload?.subjectEmail || ""}`;
}
export function htmlFor(event, body) {
  return `<div style="font-family:sans-serif;"><h2>${event}</h2><pre>${JSON.stringify(body.payload, null, 2)}</pre></div>`;
}
