import { NextRequest } from 'next/server';
import { extractTokenFromHeader, verifyJwt } from '@/lib/auth';

export interface RequestAuthContext {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
}

export async function getRequestAuthContext(
  request: NextRequest
): Promise<RequestAuthContext | null> {
  const userId = request.headers.get('x-user-id');
  const organizationId = request.headers.get('x-organization-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');

  if (userId && organizationId && email && role) {
    return {
      userId,
      organizationId,
      email,
      role,
    };
  }

  const authHeader = request.headers.get('authorization') || undefined;
  const bearerToken = extractTokenFromHeader(authHeader);
  const cookieToken = request.cookies.get('auth-token')?.value;
  const token = bearerToken || cookieToken;

  if (!token) {
    return null;
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    organizationId: payload.organizationId,
    email: payload.email,
    role: payload.role,
  };
}
