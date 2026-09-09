import { hashPassword } from './passwordHash';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD_SEC = 30;
const DIGITS = 6;
const WINDOW = 1;

export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return toBase32(bytes);
}

export function totpOtpauthUrl(email: string, secret: string): string {
  const label = encodeURIComponent(`SoftGate Comic:${email}`);
  const issuer = encodeURIComponent('SoftGate Comic');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=${DIGITS}&period=${PERIOD_SEC}`;
}

export async function generateTotpCode(secret: string, atMs = Date.now()): Promise<string> {
  return hotp(fromBase32(secret), Math.floor(atMs / 1000 / PERIOD_SEC));
}

export async function verifyTotpCode(
  secret: string,
  code: string,
  atMs = Date.now(),
): Promise<boolean> {
  const trimmed = code.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(trimmed)) return false;
  const counter = Math.floor(atMs / 1000 / PERIOD_SEC);
  const key = fromBase32(secret);
  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const expected = await hotp(key, counter + offset);
    if (expected === trimmed) return true;
  }
  return false;
}

export function hashBackupCode(code: string): string {
  return hashPassword(`backup:${code.trim().toLowerCase()}`);
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  });
}

async function hotp(key: Uint8Array, counter: number): Promise<string> {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 0x100000000));
  view.setUint32(4, counter >>> 0);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buf));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (bin % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

function toBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32[(value << (5 - bits)) & 31];
  }
  return output;
}

function fromBase32(secret: string): Uint8Array {
  const cleaned = secret.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of cleaned) {
    const idx = BASE32.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Uint8Array.from(out);
}
