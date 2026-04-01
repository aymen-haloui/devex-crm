import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['en', 'fr', 'ar'];
const DEFAULT_LOCALE = 'en';

const PUBLIC_PATHS = [
  '/',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/favicon.ico',
  '/icon.png',
  '/icon-dark-32x32.png',
  '/icon-light-32x32.png',
  '/icon.svg',
  '/apple-icon.png',
];

function detectLocale(request: NextRequest): string {
  // 1. Prefer explicit cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return cookieLocale;

  // 2. Fall back to Accept-Language header
  const acceptLang = request.headers.get('accept-language') ?? '';
  for (const part of acceptLang.split(',')) {
    const lang = part.split(';')[0].trim().substring(0, 2).toLowerCase();
    if (SUPPORTED_LOCALES.includes(lang)) return lang;
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = detectLocale(request);
  const response = NextResponse.next();

  // Ensure the NEXT_LOCALE cookie is always set so server components can read it
  if (!request.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, { path: '/', sameSite: 'lax' });
  }

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/email') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/webhook') ||
    // Allow mass-actions APIs in non-production (local dev/test) so smoke tests
    // can run without an auth cookie. In production this route remains protected.
    (process.env.NODE_ENV !== 'production' && pathname.startsWith('/api/mass-actions'))
  ) {
    return response;
  }

  // Auth check
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    const loginUrl = new URL('/', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
