import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hashes a PIN or password for storage. Uses Node's built-in scrypt (no
 * extra dependency) with a random per-secret salt, stored alongside the
 * hash as "<saltHex>:<hashHex>". Only ever called from Server
 * Actions/Route Handlers — never from proxy.ts (Middleware doesn't
 * guarantee Node's crypto module, only Web Crypto).
 */
export function hashSecret(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifySecret(plain: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(plain, salt, 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
