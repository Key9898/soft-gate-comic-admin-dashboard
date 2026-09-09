import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD_SEC = 30;
const DIGITS = 6;
const WINDOW = 1;

export function generateTotpSecret(): string {
  return toBase32(randomBytes(20));
}

export function totpOtpauthUrl(email: string, secret: string): string {
  const label = encodeURIComponent(`SoftGate Comic:${email}`);
  const issuer = encodeURIComponent('SoftGate Comic');
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=${DIGITS}&period=${PERIOD_SEC}`;
}

export function generateTotpCode(secret: string, atMs = Date.now()): string {
  return hotp(fromBase32(secret), Math.floor(atMs / 1000 / PERIOD_SEC));
}

export function verifyTotpCode(secret: string, code: string, atMs = Date.now()): boolean {
  const trimmed = code.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(trimmed)) return false;
  const counter = Math.floor(atMs / 1000 / PERIOD_SEC);
  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const expected = hotp(fromBase32(secret), counter + offset);
    if (safeEqual(expected, trimmed)) return true;
  }
  return false;
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => randomBytes(4).toString('hex'));
}

export function hashBackupCode(code: string): string {
  return createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

function hotp(key: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = bin % 10 ** DIGITS;
  return otp.toString().padStart(DIGITS, '0');
}

function toBase32(bytes: Buffer): string {
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

function fromBase32(secret: string): Buffer {
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
  return Buffer.from(out);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
