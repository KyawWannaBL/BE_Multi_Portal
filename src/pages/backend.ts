import crypto from "crypto";

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function signPayload(payload: object, secret: string) {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  return `v1.${body}.${sig}`;
}

export function verifyToken(token: string, secret: string): any | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;

  const body = parts[1];
  const sig = parts[2];

  const expected = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!ok) return null;

  const json = Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  const payload = JSON.parse(json);

  // Optional expiry check
  if (payload.exp && Date.now() > payload.exp) return null;

  return payload;
}
