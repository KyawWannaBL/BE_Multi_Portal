export type NotifyEvent =
  | "ACCOUNT_REQUEST_CREATED"
  | "ACCOUNT_REQUEST_APPROVED"
  | "ACCOUNT_REQUEST_REJECTED"
  | "AUTHORITY_REQUEST_CREATED"
  | "AUTHORITY_REQUEST_APPROVED"
  | "AUTHORITY_REQUEST_REJECTED";

export async function notify(event: NotifyEvent, payload: Record<string, unknown>, actorEmail?: string) {
  const url = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_URL as string | undefined;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event,
        at: new Date().toISOString(),
        actorEmail: actorEmail ?? null,
        payload,
      }),
    });
  } catch {
    // silent by design (production safe)
  }
}
