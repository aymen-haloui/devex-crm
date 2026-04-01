import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const JWT_EXPIRATION = '7d';
const COOKIE_NAME = 'auth-token';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
  firstName?: string;
  lastName?: string;
}

// Sign JWT
export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

// Verify JWT
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as unknown as Partial<JwtPayload>;

    if (!payload.userId || !payload.email || !payload.role || !payload.organizationId) {
      return null;
    }

    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Get token from cookie
export async function getTokenFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return token || null;
  } catch (error) {
    return null;
  }
}

// Get current user from cookie
export async function getCurrentUser(): Promise<JwtPayload | null> {
  try {
    const token = await getTokenFromCookie();
    if (!token) return null;

    const payload = await verifyJwt(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
  } catch (error) {
    console.error('Failed to set auth cookie:', error);
  }
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (error) {
    console.error('Failed to clear auth cookie:', error);
  }
}

// Extract token from header
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}
