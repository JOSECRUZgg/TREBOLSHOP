import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('next-auth.session-token')?.value

  const isOnAdmin = pathname.startsWith('/admin')
  const isOnCheckout = pathname.startsWith('/checkout')

  if (isOnAdmin || isOnCheckout) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const { payload } = await jwtVerify(token, secret)
      if (isOnAdmin && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*'],
}
