import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'iron-forge-super-secure-jwt-secret-key-2026';
export const TOKEN_COOKIE_NAME = 'gym_auth_token';

export type UserRole = 'OWNER' | 'MANAGER' | 'TRAINER' | 'RECEPTIONIST' | 'MEMBER';

export interface TokenPayload {
  userId: string;
  email: string;
  phone: string;
  role: UserRole;
  name: string;
  memberId?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['*'],
  MANAGER: [
    'members:read', 'members:write', 'members:delete',
    'payments:read', 'payments:write',
    'attendance:read', 'attendance:write',
    'classes:read', 'classes:write',
    'leads:read', 'leads:write',
    'trainers:read', 'trainers:write',
    'inventory:read', 'inventory:write',
    'expenses:read', 'expenses:write',
    'reports:read',
    'announcements:write',
  ],
  TRAINER: [
    'members:read',
    'attendance:read',
    'classes:read',
    'plans:read', 'plans:write',
    'diet:read', 'diet:write',
    'workouts:read', 'workouts:write',
  ],
  RECEPTIONIST: [
    'members:read', 'members:write',
    'payments:read', 'payments:write',
    'attendance:read', 'attendance:write',
    'leads:read', 'leads:write',
    'classes:read',
  ],
  MEMBER: [
    'self:profile',
    'self:workouts',
    'self:attendance',
    'self:classes',
    'self:membership',
  ],
};

export function hasPermission(userRole: string, permission: string): boolean {
  if (userRole === 'OWNER') return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission) || permissions.includes('*');
}
