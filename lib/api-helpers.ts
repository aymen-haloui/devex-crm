import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, JwtPayload } from '@/types';
import { verifyJwt } from './auth';

// Create a successful API response
export function successResponse<T>(data: T, meta?: any): ApiResponse<T> {
  return {
    success: true,
    data: serialize(data),
    meta,
  };
}

// Helper to serialize BigInt
export function serialize(data: any): any {
  if (data === null || data === undefined) return data;

  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}


// Create an error API response
export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Verify request has valid token
export async function verifyToken(request: NextRequest): Promise<JwtPayload | null> {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }
  
  return verifyJwt(token);
}

// JSON error response
export function jsonError(message: string, status: number = 400): NextResponse {
  return NextResponse.json(errorResponse(message), { status });
}

// JSON success response
export function jsonSuccess<T>(data: T, status: number = 200, meta?: any): NextResponse {
  return NextResponse.json(successResponse(data, meta), { status });
}

// Check authentication middleware
export function withAuth(handler: (req: NextRequest, payload: JwtPayload) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const payload = await verifyToken(request);
    
    if (!payload) {
      return jsonError('Unauthorized', 401);
    }
    
    return handler(request, payload);
  };
}

// Pagination helper
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 20
): PaginationResult<T> {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);
  
  return {
    items: paginatedItems,
    total,
    page,
    limit,
    hasMore: end < total,
  };
}

// Filter helper
export function filterItems<T extends Record<string, any>>(
  items: T[],
  filters: Record<string, any>
): T[] {
  return items.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      if (Array.isArray(value)) {
        if (!value.includes(item[key])) {
          return false;
        }
      } else if (typeof value === 'string') {
        if (!String(item[key]).toLowerCase().includes(value.toLowerCase())) {
          return false;
        }
      } else if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

// Sort helper
export function sortItems<T extends Record<string, any>>(
  items: T[],
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  if (!sortBy) {
    return items;
  }
  
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (aVal === bVal) {
      return 0;
    }
    
    if (aVal < bVal) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    
    return sortOrder === 'asc' ? 1 : -1;
  });
}

// Search params helper
export function getSearchParams(request: NextRequest): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  
  for (const [key, value] of request.nextUrl.searchParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }
  
  return params;
}

// Get pagination params from request
export function getPaginationParams(request: NextRequest) {
  const params = getSearchParams(request);
  
  const page = parseInt(String(params.page || '1'), 10);
  const limit = parseInt(String(params.limit || '20'), 10);
  const sortBy = String(params.sortBy || '');
  const sortOrder = (String(params.sortOrder || 'asc') as 'asc' | 'desc');
  
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 20 : Math.min(100, Math.max(1, limit)),
    sortBy,
    sortOrder,
  };
}

// Request body helper
export async function getRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

// CORS headers
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS request
export function handleOptions(): NextResponse {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: getCorsHeaders(),
    }
  );
}
