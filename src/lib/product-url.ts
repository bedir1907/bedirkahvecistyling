/**
 * Ürün sayfası URL'leri için TEK kaynak (sunucu + istemci güvenli, bağımlılıksız).
 *
 * Kanonik ürün adresi: `/urun/{slug}` (slug = Product.slug, benzersiz).
 * Eski adres `/product/{id}` kalıcı (308) olarak slug adresine yönlenir; bu yüzden
 * slug'ı elinde olmayan eski veriler (ör. tarayıcıda saklanan eski sepet/favori kayıtları)
 * için id ile `/product/{id}` üretmek güvenli bir yedektir.
 */

export const PRODUCT_BASE_PATH = "/urun"

/** Slug'ın URL'de olduğu gibi kullanılabilecek temiz biçimde olup olmadığı (a-z, 0-9, "-"). */
export function isCleanSlug(slug: string | null | undefined): slug is string {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

type Query = Record<string, string | number | null | undefined>

function buildQuery(query?: Query) {
  if (!query) return ""
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

/**
 * Ürün sayfası yolu. Slug varsa `/urun/{slug}`, yoksa eski `/product/{id}` (yönlendirilir).
 * `query` ile ör. `{ size: "M", from: "gomlek" }` eklenebilir (boş değerler atlanır).
 */
export function productPath(
  slug: string | null | undefined,
  id?: number | string | null,
  query?: Query
): string {
  const trimmed = typeof slug === "string" ? slug.trim() : ""
  const base = trimmed
    ? `${PRODUCT_BASE_PATH}/${encodeURIComponent(trimmed)}`
    : id !== null && id !== undefined && String(id).trim() !== ""
      ? `/product/${encodeURIComponent(String(id))}`
      : "/"
  return `${base}${buildQuery(query)}`
}

/**
 * Ürün adı (+ verilirse adda geçmeyen renk kelimeleri) → okunabilir, Türkçe karaktersiz slug.
 * Ör: ("OVERSİZE OYSHO BASİC TİŞÖRT", "BEYAZ") → "oversize-oysho-basic-tisort-beyaz".
 * Aynı modelin renkleri genelde aynı adı taşıdığından, ad çakışırsa renk eklenir (admin API).
 */
export function buildProductSlug(name: string, color?: string | null): string {
  const nameSlug = slugifyTr(name)
  const nameTokens = new Set(nameSlug.split("-").filter(Boolean))
  const extra = slugifyTr(color ?? "")
    .split("-")
    .filter((token) => token && !nameTokens.has(token))
  return [nameSlug, ...extra].filter(Boolean).join("-").slice(0, 120).replace(/-+$/g, "")
}

/** Türkçe karakterleri sadeleştirip URL güvenli slug üretir ("Kırmızı Gömlek" → "kirmizi-gomlek"). */
export function slugifyTr(text: string): string {
  return String(text ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Admin formunda slug yazılırken anlık sadeleştirme (sondaki "-" yazmaya devam edilebilsin diye korunur). */
export function normalizeSlugInput(value: string): string {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/g, "")
}
