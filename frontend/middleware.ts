import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const protectedEnv = '/dashboard,/tasks';
  const protectedPaths = protectedEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('ttt_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|assets|api).*)'],
};
