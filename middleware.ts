import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/_next/server-actions') {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost) {
      const headers = new Headers(request.headers);
      headers.set('origin', `${forwardedProto}://${forwardedHost}`);
      return NextResponse.next({ request: { headers } });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/_next/server-actions',
};
