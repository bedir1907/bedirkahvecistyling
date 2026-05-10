"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Category = {
  id: number
  name: string
  slug: string
  image: string | null
}

type Props = {
  categories: Category[]
}

export default function FeaturedCategorySlider({ categories }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const updateButtons = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
    const cardWidth = el.scrollWidth / categories.length
    const idx = Math.round(el.scrollLeft / cardWidth)
    setActiveIndex(Math.min(Math.max(idx, 0), categories.length - 1))
  }, [categories.length])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener("scroll", updateButtons, { passive: true })
    setTimeout(updateButtons, 100)
    return () => el.removeEventListener("scroll", updateButtons)
  }, [updateButtons])

  function scrollBy(dir: "prev" | "next") {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector("[data-card]") as HTMLElement
    const cardW = card ? card.offsetWidth + 16 : el.clientWidth * 0.36
    el.scrollBy({ left: dir === "next" ? cardW : -cardW, behavior: "smooth" })
  }

  function scrollToIndex(i: number) {
    const el = trackRef.current
    if (!el) return
    const cards = el.querySelectorAll("[data-card]")
    const card = cards[i] as HTMLElement
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" })
  }

  if (categories.length === 0) {
    return <p className="text-gray-500">Henüz vitrine alınmış kategori yok.</p>
  }

  // Tek kategori → tam genişlik
  if (categories.length === 1) {
    const cat = categories[0]
    return (
      <Link
        href={`/category/${cat.slug}`}
        className="group relative block rounded-[24px] overflow-hidden bg-gray-100 h-[380px] md:h-[480px]"
      >
        {cat.image && (
          <Image
            src={cat.image} alt={cat.name} fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-2">{cat.name}</h3>
          <span className="text-white/80 text-sm font-medium">İncele →</span>
        </div>
      </Link>
    )
  }

  return (
    <div className="relative">
      {/* Sol ok */}
      <button
        type="button"
        onClick={() => scrollBy("prev")}
        className={`hidden md:flex absolute left-3 top-1/2 -translate-y-6 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg items-center justify-center transition hover:bg-black hover:text-white hover:border-black ${
          canPrev ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Önceki"
      >
        <ChevronLeft size={19} strokeWidth={2.2} />
      </button>

      {/* Sağ ok */}
      <button
        type="button"
        onClick={() => scrollBy("next")}
        className={`hidden md:flex absolute right-3 top-1/2 -translate-y-6 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg items-center justify-center transition hover:bg-black hover:text-white hover:border-black ${
          canNext ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Sonraki"
      >
        <ChevronRight size={19} strokeWidth={2.2} />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            data-card=""
            href={`/category/${cat.slug}`}
            className="
              group relative shrink-0 snap-start rounded-[22px] overflow-hidden bg-gray-100 block
              h-[320px] md:h-[420px] lg:h-[460px]
              w-[72vw] sm:w-[56vw] md:w-[calc(33.333%-11px)]
            "
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 56vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

            

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <h3 className="text-white text-xl md:text-2xl font-bold leading-snug mb-1.5">
                {cat.name}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-white/75 text-sm font-medium group-hover:text-white group-hover:gap-3 transition-all duration-200">
                İncele <span>→</span>
              </span>
            </div>
          </Link>
        ))}

        {/* Sağ boşluk */}
        <div className="shrink-0 w-1" />
      </div>

      {/* Dot indikatörler */}
      {categories.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {categories.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? "w-7 h-2 bg-black"
                  : "w-2 h-2 bg-black/20 hover:bg-black/40"
              }`}
              aria-label={`${i + 1}. kategori`}
            />
          ))}
        </div>
      )}
    </div>
  )
}