import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

export async function middleware(request: NextRequest) {
  // Skip middleware for login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for admin session
  const token = request.cookies.get('admin-session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: '/admin/:path*',
}
