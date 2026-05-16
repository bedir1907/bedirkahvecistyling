import crypto from "crypto"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const COOKIE_NAME = "customer_session"

type CustomerSessionPayload = {
  customerId: number
  email: string
  exp: number
}

function getSecret() {
  const secret = process.env.CUSTOMER_AUTH_SECRET

  if (!secret) {
    throw new Error("CUSTOMER_AUTH_SECRET tanımlı değil")
  }

  return secret
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function base64UrlDecode(value: string) {
  value = value.replace(/-/g, "+").replace(/_/g, "/")
  while (value.length % 4) {
    value += "="
  }
  return Buffer.from(value, "base64").toString("utf8")
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex")
}

function safeCompare(value: string, expectedValue: string) {
  const valueBuffer = Buffer.from(value, "utf8")
  const expectedBuffer = Buffer.from(expectedValue, "utf8")

  if (valueBuffer.length !== expectedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(valueBuffer, expectedBuffer)
}

export function createCustomerSessionToken(customerId: number, email: string) {
  const payload: CustomerSessionPayload = {
    customerId,
    email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  }

  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyCustomerSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".")

  if (!encodedPayload || !signature) return null

  const expectedSignature = signPayload(encodedPayload)

  if (!safeCompare(signature, expectedSignature)) return null

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload)
    ) as CustomerSessionPayload

    if (!payload?.customerId || !payload?.email || !payload?.exp) {
      return null
    }

    if (payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export async function setCustomerSession(customerId: number, email: string) {
  const cookieStore = await cookies()
  const token = createCustomerSessionToken(customerId, email)

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearCustomerSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
}

export async function getCustomerUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const payload = verifyCustomerSessionToken(token)

  if (!payload) return null

  const customer = await prisma.customerUser.findUnique({
    where: {
      id: payload.customerId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!customer) return null

  return customer
}
