import { NextResponse } from "next/server"
import { verifyOrderPayment } from "@/lib/iyzico-payment"
import { prisma } from "@/lib/prisma"
import { sendOrderEmail } from "@/lib/mail"

function cleanBaseUrl(value?: string | null) {
  if (!value) return null

  const normalized = String(value).trim().replace(/\/$/, "")

  if (
    !normalized ||
    normalized === "null" ||
    normalized === "undefined"
  ) {
    return null
  }

  try {
    new URL(normalized)
    return normalized
  } catch {
    return null
  }
}

function getBaseUrl(request: Request) {
  const url = new URL(request.url)

  const origin = cleanBaseUrl(request.headers.get("origin"))
  if (origin) return origin

  const referer = request.headers.get("referer")
  if (referer && referer !== "null" && referer !== "undefined") {
    try {
      const refererUrl = new URL(referer)
      const cleaned = cleanBaseUrl(refererUrl.origin)
      if (cleaned) return cleaned
    } catch {
      // ignore
    }
  }

  const forwardedProtoRaw = request.headers.get("x-forwarded-proto")
  const forwardedHostRaw =
    request.headers.get("x-forwarded-host") || request.headers.get("host")

  const forwardedProto =
    forwardedProtoRaw &&
    forwardedProtoRaw !== "null" &&
    forwardedProtoRaw !== "undefined"
      ? forwardedProtoRaw.replace(":", "")
      : null

  const forwardedHost = cleanBaseUrl(
    forwardedHostRaw
      ? `${forwardedProto || url.protocol.replace(":", "")}://${forwardedHostRaw}`
      : null
  )

  if (forwardedHost) return forwardedHost

  const envBaseUrl = cleanBaseUrl(process.env.APP_BASE_URL)
  if (envBaseUrl) return envBaseUrl

  return cleanBaseUrl(url.origin) || "http://localhost:3000"
}

export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request)

  try {
    const formData = await request.formData()
    const token = String(formData.get("token") || "").trim()

    if (!token) {
      return NextResponse.redirect(new URL("/checkout/fail?reason=no-token", baseUrl))
    }

    const verification = await verifyOrderPayment({ token })

    if (verification.state === "PAID") {
      if (verification.justPaidNow) {
        const order = await prisma.order.findFirst({
          where: { orderNumber: verification.orderNumber },
        })

        if (order) {
          try {
            await sendOrderEmail({
              to: order.email,
              name: order.name,
              orderNumber: order.orderNumber,
              total: order.totalPrice,
            })
          } catch (mailError) {
            console.error("Sipariş maili gönderilemedi:", mailError)
          }
        }
      }

      return NextResponse.redirect(
        new URL(
          `/checkout/success?orderNumber=${encodeURIComponent(
            verification.orderNumber || ""
          )}`,
          baseUrl
        )
      )
    }

    return NextResponse.redirect(
      new URL(
        `/checkout/fail?orderNumber=${encodeURIComponent(
          verification.orderNumber || ""
        )}&reason=${encodeURIComponent(verification.state)}`,
        baseUrl
      )
    )
  } catch (error) {
    console.error("Iyzico callback hatası:", error)

    return NextResponse.redirect(
      new URL("/checkout/fail?reason=callback-error", baseUrl)
    )
  }
}