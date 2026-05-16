const DEFAULT_BASE_URL = "http://localhost:3000"

function cleanBaseUrl(value?: string | null) {
  if (!value) return null

  const normalized = String(value).trim().replace(/\/$/, "")

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return null
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

export function getTrustedBaseUrl() {
  return cleanBaseUrl(process.env.APP_BASE_URL) || DEFAULT_BASE_URL
}
