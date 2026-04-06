"use client"

import Link from "next/link"
import Image from "next/image"

type CardColor = {
  id: number
  color: string | null
  image: string
}

type Props = {
  id?: number
  name: string
  price: number
  oldPrice?: number | null
  image: string
  hoverImage?: string | null
  href?: string
  colorName?: string | null
  category?: string
  colors?: CardColor[]
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

export default function ProductCard({
  id,
  name,
  price,
  oldPrice,
  image,
  hoverImage,
  href,
  colorName,
  category,
  colors = [],
}: Props) {
  const productHref = href || `/product/${id}`
  const safeImage = image && image.trim().length > 0 ? image : FALLBACK_IMAGE
  const safeHoverImage =
    hoverImage && hoverImage.trim().length > 0 ? hoverImage : null
  const safeName = name && name.trim().length > 0 ? name : "Ürün"

  const hasDiscount =
    oldPrice !== null &&
    oldPrice !== undefined &&
    oldPrice > price

  const discountRate = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null

  return (
    <article className="group">
      <Link href={productHref} className="block">
        <div className="relative overflow-hidden rounded-[24px] bg-gray-100">
          <Image
            src={safeImage}
            alt={safeName}
            width={500}
            height={650}
            className={`w-full h-[360px] object-cover transition-all duration-500 ${
              safeHoverImage
                ? "group-hover:opacity-0 group-hover:scale-[1.02]"
                : "group-hover:scale-105"
            }`}
          />

          {safeHoverImage && (
            <Image
              src={safeHoverImage}
              alt={`${safeName} hover`}
              width={500}
              height={650}
              className="absolute inset-0 w-full h-[360px] object-cover opacity-0 scale-[1.02] transition-all duration-500 group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-300" />

          {hasDiscount && discountRate && (
            <span className="absolute top-4 left-4 bg-black text-white text-[11px] md:text-xs px-3 py-1.5 rounded-full z-10 tracking-wide">
              %{discountRate} İndirim
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
              <span className="block text-center text-sm font-medium tracking-wide">
                Ürünü İncele
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-4 space-y-2">
        {category ? (
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
            {category}
          </p>
        ) : null}

        <h3 className="text-[17px] font-medium leading-snug tracking-tight transition group-hover:text-gray-600">
          {safeName}
        </h3>

        {colorName ? (
          <p className="text-sm text-gray-500">{colorName}</p>
        ) : null}

        {colors.length > 1 && (
          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {colors.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-gray-100 shadow-sm"
                  title={item.color || "Renk"}
                >
                  <Image
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.color || "Renk"}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </span>
              ))}
            </div>

            <span className="text-xs text-gray-500">
              {colors.length} renk seçeneği
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-semibold tracking-tight">₺{price}</span>

          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ₺{oldPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}