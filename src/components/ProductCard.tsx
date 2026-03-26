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
  oldPrice: number | null
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
    <div className="group">
      <Link href={productHref}>
        <div className="relative overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={safeImage}
            alt={safeName}
            width={500}
            height={600}
            className={`w-full h-[350px] object-cover transition-all duration-500 ${
              safeHoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
            }`}
          />

          {safeHoverImage && (
            <Image
              src={safeHoverImage}
              alt={`${safeName} hover`}
              width={500}
              height={600}
              className="absolute inset-0 w-full h-[350px] object-cover opacity-0 transition-all duration-500 group-hover:opacity-100"
            />
          )}

          {hasDiscount && discountRate && (
            <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 rounded-full z-10">
              %{discountRate} İndirim
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
              <span className="block text-center text-sm font-medium">
                Ürünü İncele
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3 space-y-2">
        {category ? (
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
            {category}
          </p>
        ) : null}

        <h3 className="text-base font-medium tracking-wide transition group-hover:text-gray-500 leading-snug">
          {safeName}
        </h3>

        {colorName ? (
          <p className="text-sm text-gray-500">{colorName}</p>
        ) : null}

        {colors.length > 1 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {colors.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-gray-100"
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

        <div className="flex items-center gap-2 text-base">
          <span className="font-semibold">₺{price}</span>

          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              ₺{oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}