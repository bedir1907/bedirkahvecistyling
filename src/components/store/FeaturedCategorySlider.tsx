"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
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

function CategoryCard({ cat, className }: { cat: Category; className?: string }) {
  return (
    <Link
      href={`/category/${cat.slug}`}
      className={`group relative rounded-[22px] overflow-hidden bg-gray-100 block ${className ?? ""}`}
    >
      {cat.image ? (
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 90vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
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
  )
}

export default function FeaturedCategorySlider({ categories }: Props) {
  const n = categories.length
  if (n === 0) return null

  if (n === 1) {
    const cat = categories[0]
    return (
      <Link
        href={`/category/${cat.slug}`}
        className="group relative block rounded-3xl overflow-hidden bg-gray-100 h-95 md:h-120"
      >
        {cat.image && (
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <h3 className="text-white text-3xl md:text-4xl font-bold mb-2">{cat.name}</h3>
          <span className="text-white/80 text-sm font-medium">İncele →</span>
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile: native snap scroll (1 card at a time, peek of next) */}
      <div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-1">
        {categories.map((cat) => (
          <div key={cat.id} className="snap-start shrink-0 w-[82vw]">
            <CategoryCard cat={cat} className="h-75" />
          </div>
        ))}
      </div>

      {/* Desktop: 3-wide infinite slider with arrows */}
      <div className="hidden md:block">
        <DesktopSlider categories={categories} />
      </div>
    </>
  )
}

// ─── Desktop Slider (md+) ─────────────────────────────────────────────────────

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

function DesktopSlider({ categories }: { categories: Category[] }) {
  const n = categories.length

  const extended = [
    categories[wrap(n - 2, n)],
    categories[wrap(n - 1, n)],
    ...categories,
    categories[wrap(0, n)],
    categories[wrap(1, n)],
    categories[wrap(2, n)],
  ]
  const total = extended.length
  const OFFSET = 2

  const [pos, setPos] = useState(OFFSET)
  const [animate, setAnimate] = useState(true)
  const busy = useRef(false)

  useEffect(() => {
    if (!animate) {
      const t = setTimeout(() => setAnimate(true), 30)
      return () => clearTimeout(t)
    }
  }, [animate])

  function goTo(newPos: number) {
    if (busy.current) return
    busy.current = true
    setAnimate(true)
    setPos(newPos)
  }

  function onTransitionEnd() {
    busy.current = false
    if (pos === OFFSET + n) { setAnimate(false); setPos(OFFSET) }
    else if (pos === OFFSET + n + 1) { setAnimate(false); setPos(OFFSET + 1) }
    else if (pos === 1) { setAnimate(false); setPos(OFFSET + n - 1) }
    else if (pos === 0) { setAnimate(false); setPos(OFFSET + n - 2) }
  }

  function next() { goTo(pos + 1) }
  function prev() { goTo(pos - 1) }

  const activeIndex = wrap(pos - OFFSET, n)
  const translateX = -(pos / total) * 100

  return (
    <div className="relative">
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-6 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg flex items-center justify-center transition hover:bg-black hover:text-white hover:border-black"
        aria-label="Önceki"
      >
        <ChevronLeft size={19} strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-6 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg flex items-center justify-center transition hover:bg-black hover:text-white hover:border-black"
        aria-label="Sonraki"
      >
        <ChevronRight size={19} strokeWidth={2.2} />
      </button>

      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            width: `${(total / 3) * 100}%`,
            transform: `translateX(${translateX}%)`,
            transition: animate ? "transform 0.45s ease" : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((cat, i) => (
            <div key={i} style={{ width: `${100 / total}%` }} className="px-2">
              <CategoryCard cat={cat} className="h-105 lg:h-115" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-5">
        {categories.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i + OFFSET)}
            className={`rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "w-7 h-2 bg-black"
                : "w-2 h-2 bg-black/20 hover:bg-black/40"
            }`}
            aria-label={`${i + 1}. kategori`}
          />
        ))}
      </div>
    </div>
  )
}
