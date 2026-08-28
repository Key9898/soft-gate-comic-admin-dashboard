import jwt from 'jsonwebtoken';
import type { Response } from 'express';
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

export function setStaffCookie(res: Response, payload: StaffJwtPayload): void {
  const token = signStaffToken(payload);
  res.cookie(STAFF_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearStaffCookie(res: Response): void {
  res.clearCookie(STAFF_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}
