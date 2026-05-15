import { verifyOrderPayment } from "@/lib/iyzico-payment"
import { prisma } from "@/lib/prisma"
import { sendOrderEmail } from "@/lib/customer-email"
export const runtime = "nodejs"

function cleanBaseUrl(value?: string | null) {
  if (!value) return null
  const normalized = String(value).trim().replace(/\/$/, "")
  if (!normalized || normalized === "null" || normalized === "undefined") return null
  try {
    new URL(normalized)
    return normalized
  } catch {
    return null
  }
}

function getBaseUrl(request: Request) {
  const url = new URL(request.url)
  const envBaseUrl = cleanBaseUrl(process.env.APP_BASE_URL)
  if (envBaseUrl) return envBaseUrl

  const origin = cleanBaseUrl(request.headers.get("origin"))
  if (origin) return origin

  const referer = request.headers.get("referer")
  if (referer && referer !== "null" && referer !== "undefined") {
    try {
      const refererUrl = new URL(referer)
      const cleaned = cleanBaseUrl(refererUrl.origin)
      if (cleaned) return cleaned
    } catch { }
  }

  const forwardedProtoRaw = request.headers.get("x-forwarded-proto")
  const forwardedHostRaw = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const forwardedProto = forwardedProtoRaw && forwardedProtoRaw !== "null" && forwardedProtoRaw !== "undefined"
    ? forwardedProtoRaw.replace(":", "") : null
  const forwardedHost = cleanBaseUrl(
    forwardedHostRaw ? `${forwardedProto || url.protocol.replace(":", "")}://${forwardedHostRaw}` : null
  )
  if (forwardedHost) return forwardedHost
  return cleanBaseUrl(url.origin) || "http://localhost:3000"
}

// Iyzico POST ile yönlendirdiği için 302 redirect 405 hatasına yol açıyor.
// Bunun yerine HTML döndürüp browser'ın GET ile gitmesini sağlıyoruz.
function htmlRedirect(url: string): Response {
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${url}">
  <title>Yönlendiriliyor...</title>
  <script>
    try { window.location.replace(${JSON.stringify(url)}) } catch(e) {}
  </script>
</head>
<body>
  <p>Yönlendiriliyor, lütfen bekleyin...</p>
  <a href="${url}">Tıkla</a>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}

export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request)

  try {
    const formData = await request.formData()
    const token = String(formData.get("token") || "").trim()

    if (!token) {
      return htmlRedirect(`${baseUrl}/checkout/fail?reason=no-token`)
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

      return htmlRedirect(
        `${baseUrl}/checkout/success?orderNumber=${encodeURIComponent(verification.orderNumber || "")}`
      )
    }

    return htmlRedirect(
      `${baseUrl}/checkout/fail?orderNumber=${encodeURIComponent(verification.orderNumber || "")}&reason=${encodeURIComponent(verification.state)}`
    )
  } catch (error) {
    console.error("Iyzico callback hatası:", error)
    return htmlRedirect(`${baseUrl}/checkout/fail?reason=callback-error`)
  }
}