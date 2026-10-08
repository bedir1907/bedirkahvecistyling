const DEFAULT_BASE_URL = "http://localhost:3000"

function cleanBaseUrl(value?: string | null) {
  if (!value) return null

  let normalized = String(value).trim().replace(/\/+$/, "")

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return null
  }

  // VERCEL_PROJECT_PRODUCTION_URL protokolsüz gelir (ör. "www.site.com")
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`
  }

  try {
    const url = new URL(normalized)

    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

let warnedFallback = false

/**
 * Sunucunun kendi mutlak adresi (iyzico callbackUrl, e-posta linkleri vb.).
 * Öncelik: APP_BASE_URL → NEXT_PUBLIC_SITE_URL → VERCEL_PROJECT_PRODUCTION_URL → localhost.
 * Request'teki Host header'ına güvenilmez.
 */
export function getTrustedBaseUrl() {
  const resolved =
    cleanBaseUrl(process.env.APP_BASE_URL) ||
    cleanBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanBaseUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL)

  if (resolved) return resolved

  if (process.env.NODE_ENV === "production" && !warnedFallback) {
    warnedFallback = true
    console.error(
      "[base-url] APP_BASE_URL tanımlı değil; localhost kullanılıyor. iyzico callback ve e-posta linkleri çalışmaz!"
    )
  }

  return DEFAULT_BASE_URL
}
