import { prisma } from "@/lib/prisma"
import { buildProductSlug, slugifyTr } from "@/lib/product-url"

/** Admin ürün API'leri için slug & SEO alanı yardımcıları (yalnızca sunucu). */

export const META_TITLE_MAX = 60
export const META_DESCRIPTION_MAX = 160
/** Önerilen sınırın biraz üstüne izin verilir; daha uzunu reddedilir. */
const META_TITLE_HARD_MAX = 120
const META_DESCRIPTION_HARD_MAX = 320

/** Admin'in girdiği slug'ı URL güvenli hale getirir (boşsa ""). */
export function normalizeProductSlug(value: unknown) {
  return slugifyTr(String(value ?? "").trim()).slice(0, 120).replace(/-+$/g, "")
}

/**
 * Addan slug üretir; başka üründe varsa renk eklenir ("…-siyah"), o da varsa "-2", "-3" …
 * `excludeId` verilirse o ürünün kendi slug'ı çakışma sayılmaz.
 */
export async function findAvailableProductSlug(name: string, color?: string | null, excludeId?: number) {
  const plain = buildProductSlug(name)
  const withColor = buildProductSlug(name, color)
  if (!plain) return ""
  const candidates = [...new Set([plain, withColor])]
  for (let i = 2; i < 50; i++) candidates.push(`${withColor}-${i}`)
  for (const candidate of candidates) {
    const existing = await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    })
    if (!existing) return candidate
  }
  return `${withColor}-${Date.now().toString(36)}`
}

/**
 * Formdan gelen slug otomatik öneriyle (addan üretilen) aynıysa "elle girilmiş" sayılmaz:
 * çakışırsa hata yerine renk/sayı eklenerek benzersiz hale getirilir.
 */
export function isAutoSlug(slug: string, name: string, color?: string | null) {
  return slug === buildProductSlug(name) || slug === buildProductSlug(name, color)
}

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim()
}

/** İstek gövdesinden metaTitle/metaDescription okur (boş → null). */
export function readSeoFields(body: Record<string, unknown>):
  | { metaTitle: string | null; metaDescription: string | null; hasTitle: boolean; hasDescription: boolean }
  | { error: string } {
  const metaTitle = cleanText(body.metaTitle) || null
  const metaDescription = cleanText(body.metaDescription) || null

  if (metaTitle && metaTitle.length > META_TITLE_HARD_MAX) {
    return { error: `Meta başlık en fazla ${META_TITLE_HARD_MAX} karakter olabilir (önerilen ≤${META_TITLE_MAX})` }
  }
  if (metaDescription && metaDescription.length > META_DESCRIPTION_HARD_MAX) {
    return {
      error: `Meta açıklama en fazla ${META_DESCRIPTION_HARD_MAX} karakter olabilir (önerilen ≤${META_DESCRIPTION_MAX})`,
    }
  }

  return {
    metaTitle,
    metaDescription,
    hasTitle: Object.prototype.hasOwnProperty.call(body, "metaTitle"),
    hasDescription: Object.prototype.hasOwnProperty.call(body, "metaDescription"),
  }
}
