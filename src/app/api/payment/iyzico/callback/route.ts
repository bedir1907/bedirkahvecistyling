import { verifyOrderPayment } from "@/lib/iyzico-payment"
import { getTrustedBaseUrl } from "@/lib/base-url"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// iyzico ödeme sonrası tarayıcıyı callbackUrl'e form POST (x-www-form-urlencoded, `token`) ile gönderir.
// 303 See Other tarayıcının hedef sayfaya GET ile gitmesini garanti eder (307/308 POST'u korur → 405).
function redirectTo(url: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: url, "Cache-Control": "no-store" },
  })
}

async function handleToken(token: string) {
  const baseUrl = getTrustedBaseUrl()

  if (!token) {
    return redirectTo(`${baseUrl}/checkout/fail?reason=no-token`)
  }

  try {
    // Token yalnızca anahtar olarak kullanılır; ödeme sonucu iyzico'dan tekrar sorgulanır.
    const verification = await verifyOrderPayment({ token })

    if (verification.state === "PAID") {
      return redirectTo(
        `${baseUrl}/checkout/success?orderNumber=${encodeURIComponent(verification.orderNumber || "")}`
      )
    }

    return redirectTo(
      `${baseUrl}/checkout/fail?orderNumber=${encodeURIComponent(verification.orderNumber || "")}&reason=${encodeURIComponent(verification.state)}`
    )
  } catch (error) {
    console.error("Iyzico callback hatası:", error)
    return redirectTo(`${baseUrl}/checkout/fail?reason=callback-error`)
  }
}

export async function POST(request: Request) {
  let token = ""

  try {
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = await request.json()
      token = String(body?.token || "").trim()
    } else {
      const formData = await request.formData()
      token = String(formData.get("token") || "").trim()
    }
  } catch (error) {
    console.error("Iyzico callback body okunamadı:", error)
  }

  return handleToken(token)
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || ""
  return handleToken(token)
}
