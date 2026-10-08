import type { ImageLoaderProps } from "next/image"

const UPLOAD_MARKER = "/image/upload/"

/** Dönüşüm eklenebilecek bir Cloudinary görsel adresi mi? */
export function isCloudinaryImage(src: string | null | undefined): src is string {
  return typeof src === "string" && src.startsWith("https://res.cloudinary.com/") && src.includes(UPLOAD_MARKER)
}

/**
 * next/image loader'ı: boyutlandırma ve WebP/AVIF dönüşümünü doğrudan Cloudinary CDN'i yapar.
 * Vercel görsel optimizasyon kotasını harcamaz, HTML'deki srcset adresleri de kısalır.
 * Yalnızca isCloudinaryImage() true olan adreslerle kullanılmalı.
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const transform = `f_auto,q_${quality ?? "auto"},c_limit,w_${width}`
  return src.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transform}/`)
}

/** Cloudinary görselleri için loader, diğerleri için varsayılan (Next) optimizasyon. */
export function imageLoaderFor(src: string | null | undefined) {
  return isCloudinaryImage(src) ? cloudinaryLoader : undefined
}

/** CSS arka planı vb. için tek boyutlu optimize adres (Cloudinary değilse olduğu gibi döner). */
export function optimizedImageUrl(src: string, width: number) {
  return isCloudinaryImage(src) ? cloudinaryLoader({ src, width }) : src
}
