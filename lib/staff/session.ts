/**
 * Signed session token for the /ansatt feature. Uses the Web Crypto API
 * (crypto.subtle) rather than Node's `crypto` module, since this is
 * verified from proxy.ts (Middleware), which does not guarantee access to
 * Node built-ins — Web Crypto works in both the Node and Edge runtimes.
 */

export type StaffRole = "ansatt" | "leder";

export type StaffSessionPayload = {
  sub: string;
  role: StaffRole;
  name: string;
  iat: number;
  exp: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padding));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createStaffToken(
  payload: StaffSessionPayload,
  secret: string
): Promise<string> {
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const signatureB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${signatureB64}`;
}

export async function verifyStaffToken(
  token: string,
  secret: string
): Promise<StaffSessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signatureB64] = parts;

  try {
    const key = await hmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signatureB64) as BufferSource,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64))
    ) as StaffSessionPayload;

    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "ansatt" && payload.role !== "leder") ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export const STAFF_SESSION_COOKIE = "ansatt_session";
export const STAFF_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

export function staffSessionSecret(): string {
  const secret = process.env.STAFF_SESSION_SECRET;
  if (!secret) {
    throw new Error("STAFF_SESSION_SECRET er ikke satt.");
  }
  return secret;
}
