import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/src/lib/session-crypto'

const PUBLIC_ROUTES = ['/admin/login', '/admin/setup', '/admin/forgot-password', '/admin/reset-password', '/admin/onboarding']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin_session')?.value
  const session = await decrypt(token)

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/admin/:path*'],
}
