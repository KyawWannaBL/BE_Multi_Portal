/**
 * WebAuthn (Passkeys) helper.
 * This implements a *client-side biometric gate* (TouchID/Windows Hello/Android biometrics).
 *
 * Important:
 * - This "unlock gate" is for UX + device-local access.
 * - Strong enterprise security requires server-side verification of assertions.
 */

export type PasskeyCredential = {
  id: string; // base64url
  createdAt: string;
  label?: string;
};

function b64urlEncode(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  const b64 = btoa(bin);
  return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function b64urlDecode(s: string): ArrayBuffer {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replaceAll('-', '+').replaceAll('_', '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function randomBytes(len = 32): Uint8Array {
  const out = new Uint8Array(len);
  crypto.getRandomValues(out);
  return out;
}

async function emailToUserIdBytes(email: string): Promise<Uint8Array> {
  const enc = new TextEncoder().encode(email.trim().toLowerCase());
  if (!crypto.subtle) return randomBytes(32);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return new Uint8Array(digest).slice(0, 32);
}

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof navigator !== 'undefined' &&
    !!navigator.credentials
  );
}

export async function canUsePlatformAuthenticator(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  const fn = (window.PublicKeyCredential as any)?.isUserVerifyingPlatformAuthenticatorAvailable;
  if (typeof fn !== 'function') return false;
  try {
    return await fn.call(window.PublicKeyCredential);
  } catch {
    return false;
  }
}

export async function registerPlatformPasskey(params: {
  rpName: string;
  userEmail: string;
  userDisplayName: string;
  excludeCredentialIds?: string[];
}): Promise<PasskeyCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn not supported');
  }

  const userId = await emailToUserIdBytes(params.userEmail);
  const challenge = randomBytes(32);

  const excludeCredentials =
    params.excludeCredentialIds?.map((id) => ({
      type: 'public-key' as const,
      id: b64urlDecode(id)
    })) ?? [];

  const publicKey: PublicKeyCredentialCreationOptions['publicKey'] = {
    challenge,
    rp: { name: params.rpName, id: window.location.hostname },
    user: {
      id: userId,
      name: params.userEmail,
      displayName: params.userDisplayName || params.userEmail
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }, // ES256
      { type: 'public-key', alg: -257 } // RS256
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred'
    },
    excludeCredentials
  };

  const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
  if (!cred) throw new Error('Passkey creation cancelled');

  return {
    id: b64urlEncode(cred.rawId),
    createdAt: new Date().toISOString()
  };
}

export async function authenticateWithPasskey(params: {
  credentialId: string;
}): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;

  const challenge = randomBytes(32);
  const allowCredentials = [
    {
      type: 'public-key' as const,
      id: b64urlDecode(params.credentialId),
      transports: ['internal'] as AuthenticatorTransport[]
    }
  ];

  const publicKey: PublicKeyCredentialRequestOptions['publicKey'] = {
    challenge,
    allowCredentials,
    userVerification: 'required',
    timeout: 60000
  };

  const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
  if (!assertion) return false;

  // NOTE: For real security, verify assertion server-side.
  // Here we only rely on the browser/platform authenticator’s user verification.
  return b64urlEncode(assertion.rawId) === params.credentialId;
}
