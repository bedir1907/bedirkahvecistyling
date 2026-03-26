import { SignJWT, jwtVerify } from "jose"

const secret = process.env.ADMIN_JWT_SECRET

if (!secret) {
  throw new Error("ADMIN_JWT_SECRET tanımlı değil")
}

const secretKey = new TextEncoder().encode(secret)

export type AdminTokenPayload = {
  userId: number
  email: string
  role: "CREATOR" | "MANAGER" | "SALES"
  canManageProducts: boolean
  canManageStock: boolean
  canManageUsers: boolean
  canAssignPermissions: boolean
  canSell: boolean
  canViewOrders: boolean
  canViewSensitiveData: boolean
}

export async function createAdminToken(payload: AdminTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as AdminTokenPayload
  } catch {
    return null
  }
}