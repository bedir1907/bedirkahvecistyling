import { NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPage = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/admin/login"
  const isAdminApiLogin = pathname === "/api/admin/login"
  const isAdminApiLogout = pathname === "/api/admin/logout"

  if (!isAdminPage && !pathname.startsWith("/api/admin")) {
    return NextResponse.next()
  }

  if (isLoginPage || isAdminApiLogin || isAdminApiLogout) {
    return NextResponse.next()
  }

  const token = request.cookies.get("admin_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  const user = await verifyAdminToken(token)

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (
    (pathname.startsWith("/admin/products") ||
      pathname.startsWith("/api/admin/products")) &&
    !user.canManageProducts
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  if (
    (pathname.startsWith("/admin/users") ||
      pathname.startsWith("/api/admin/users")) &&
    !user.canManageUsers
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}