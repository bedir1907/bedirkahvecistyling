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
  href,
  colorName,
  category,
  colors = [],
}: Props) {
  const productHref = href || `/product/${id}`
  const safeImage = image && image.trim().length > 0 ? image : FALLBACK_IMAGE
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
        <div className="relative overflow-hidden rounded-[18px] md:rounded-[24px] bg-gray-100">
          <Image
            src={safeImage}
            alt={safeName}
            width={500}
            height={650}
            className="w-full h-[240px] sm:h-[300px] md:h-[360px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition duration-300" />

          {hasDiscount && discountRate ? (
            <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-black text-white text-[10px] md:text-xs px-2.5 py-1.5 rounded-full z-10 tracking-wide">
              %{discountRate} İndirim
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10 hidden md:block">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
              <span className="block text-center text-sm font-medium tracking-wide">
                Ürünü İncele
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2">
        {category ? (
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-gray-400">
            {category}
          </p>
        ) : null}

        <h3 className="text-[14px] sm:text-[15px] md:text-[17px] font-medium leading-[1.35] tracking-tight transition group-hover:text-gray-600 line-clamp-2 min-h-[38px] md:min-h-[46px]">
          {safeName}
        </h3>

        {colorName ? (
          <p className="text-xs md:text-sm text-gray-500">{colorName}</p>
        ) : null}

        {colors.length > 1 ? (
          <div className="flex items-center gap-2 md:gap-3 pt-1">
            <div className="flex -space-x-2">
              {colors.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="relative w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden border-2 border-white bg-gray-100 shadow-sm"
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

            <span className="text-[11px] md:text-xs text-gray-500">
              {colors.length} renk
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-1">
          <span className="text-[15px] sm:text-base md:text-lg font-semibold tracking-tight">
            ₺{price}
          </span>

          {hasDiscount ? (
            <span className="text-xs md:text-sm text-gray-400 line-through">
              ₺{oldPrice}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}