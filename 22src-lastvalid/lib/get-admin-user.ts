import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function getAdminUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  if (!token) return null

  return await verifyAdminToken(token)
}   