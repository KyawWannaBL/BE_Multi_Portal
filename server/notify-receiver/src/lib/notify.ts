export type NotifyEvent =
  | "ACCOUNT_REQUEST_CREATED"
  | "ACCOUNT_REQUEST_APPROVED"
  | "ACCOUNT_REQUEST_REJECTED"
  | "AUTHORITY_REQUEST_CREATED"
  | "AUTHORITY_REQUEST_APPROVED"
  | "AUTHORITY_REQUEST_REJECTED";

/**
 * Posts to a webhook if configured.
 * Vite env:
 * - VITE_NOTIFY_WEBHOOK_URL
 * - VITE_NOTIFY_WEBHOOK_SECRET (optional) -> sent as x-notify-secret
 * - VITE_APP_BASE_URL (optional) -> sent to receiver to generate action links
 */
export async function notify(event: NotifyEvent, payload: Record<string, unknown>, actorEmail?: string) {
  const url = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_URL as string | undefined;
  if (!url) return;

  const secret = (import.meta as any)?.env?.VITE_NOTIFY_WEBHOOK_SECRET as string | undefined;
  const appBaseUrl = (import.meta as any)?.env?.VITE_APP_BASE_URL as string | undefined;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { "x-notify-secret": secret } : {}),
      },
      body: JSON.stringify({
        event,
        at: new Date().toISOString(),
        actorEmail: actorEmail ?? null,
        appBaseUrl: appBaseUrl ?? null,
        payload,
      }),
    });
  } catch {
    // silent by design
  }
}
