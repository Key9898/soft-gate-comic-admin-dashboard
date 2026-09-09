import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { staffClearCookieOptions, staffCookieOptions } from './cookieOptions.js';
import type { StaffRole } from './rbac.js';

export const STAFF_COOKIE = 'sg_staff';
const JWT_EXPIRES = '7d';

export type StaffJwtPayload = {
  sub: string;
  email: string;
  role: StaffRole;
};

function jwtSecret(): string | undefined {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) return undefined;
  return secret;
}

export function signStaffToken(payload: StaffJwtPayload): string {
  const secret = jwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES });
}

export function verifyStaffToken(token: string): StaffJwtPayload | null {
  const secret = jwtSecret();
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as StaffJwtPayload;
    if (!decoded.sub || !decoded.email || !decoded.role) return null;
    return decoded;
  } catch {
    return null;
  }
}

export const MFA_COOKIE = 'sg_staff_mfa';
const MFA_EXPIRES = '5m';
const MFA_MAX_AGE_MS = 5 * 60 * 1000;

export type MfaJwtPayload = {
  sub: string;
  email: string;
  role: StaffRole;
  typ: 'mfa';
};

export function signMfaToken(payload: Omit<MfaJwtPayload, 'typ'>): string {
  const secret = jwtSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign({ ...payload, typ: 'mfa' }, secret, { expiresIn: MFA_EXPIRES });
}

export function verifyMfaToken(token: string): MfaJwtPayload | null {
  const secret = jwtSecret();
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as MfaJwtPayload;
    if (decoded.typ !== 'mfa' || !decoded.sub || !decoded.email || !decoded.role) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function setStaffCookie(res: Response, payload: StaffJwtPayload): void {
  const token = signStaffToken(payload);
  res.cookie(STAFF_COOKIE, token, staffCookieOptions());
}

export function clearStaffCookie(res: Response): void {
  res.clearCookie(STAFF_COOKIE, staffClearCookieOptions());
}

export function setMfaCookie(res: Response, payload: Omit<MfaJwtPayload, 'typ'>): void {
  res.cookie(MFA_COOKIE, signMfaToken(payload), {
    ...staffCookieOptions(),
    maxAge: MFA_MAX_AGE_MS,
  });
}

export function clearMfaCookie(res: Response): void {
  res.clearCookie(MFA_COOKIE, staffClearCookieOptions());
}
