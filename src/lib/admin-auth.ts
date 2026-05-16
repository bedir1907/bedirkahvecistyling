import { SignJWT, jwtVerify } from "jose"

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

function getSecretKey() {
  const secret = process.env.ADMIN_JWT_SECRET

  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET tanimli degil")
  }

  return new TextEncoder().encode(secret)
}

export async function createAdminToken(payload: AdminTokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey())
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload as AdminTokenPayload
  } catch {
    return null
  }
}
