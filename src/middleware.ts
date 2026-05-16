import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

function isUnsafeMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
}

function isTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  const appBaseUrl = process.env.APP_BASE_URL
  const allowedOrigins = new Set([request.nextUrl.origin])

  if (appBaseUrl) {
    try {
      allowedOrigins.add(new URL(appBaseUrl).origin)
    } catch {
      // Invalid APP_BASE_URL is handled by runtime configuration elsewhere.
    }
  }

  const source = origin || referer

  if (!source) {
    return true
  }

  try {
    return allowedOrigins.has(new URL(source).origin)
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const ADMIN_PATH = "/bksy0net1mp4neli"

  const isAdminPage = pathname.startsWith(ADMIN_PATH)
  const isAdminApi = pathname.startsWith("/api/admin")
  const isCustomerApi = pathname.startsWith("/api/customer")
  const isLoginPage = pathname === `${ADMIN_PATH}/login`
  const isAdminApiLogin = pathname === "/api/admin/login"
  const isAdminApiLogout = pathname === "/api/admin/logout"

  if (!isAdminPage && !isAdminApi && !isCustomerApi) {
    return NextResponse.next()
  }

  if ((isAdminApi || isCustomerApi) && isUnsafeMethod(request.method)) {
    if (!isTrustedOrigin(request)) {
      return NextResponse.json({ error: "Gecersiz istek kaynagi" }, { status: 403 })
    }
  }

  if (isCustomerApi) {
    return NextResponse.next()
  }

  if (isLoginPage || isAdminApiLogin || isAdminApiLogout) {
    return NextResponse.next()
  }

  const token = request.cookies.get("admin_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL(`${ADMIN_PATH}/login`, request.url))
  }

  const user = await verifyAdminToken(token)

  if (!user) {
    return NextResponse.redirect(new URL(`${ADMIN_PATH}/login`, request.url))
  }

  if (
    (pathname.startsWith(`${ADMIN_PATH}/products`) ||
      pathname.startsWith("/api/admin/products")) &&
    !user.canManageProducts
  ) {
    return NextResponse.redirect(new URL(ADMIN_PATH, request.url))
  }

  if (
    (pathname.startsWith(`${ADMIN_PATH}/users`) ||
      pathname.startsWith("/api/admin/users")) &&
    !user.canManageUsers
  ) {
    return NextResponse.redirect(new URL(ADMIN_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/bksy0net1mp4neli/:path*", "/api/admin/:path*", "/api/customer/:path*"],
}
