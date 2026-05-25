"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AutoplayVideo from "@/components/store/AutoplayVideo"

type Category = {
  id: number
  name: string
  slug: string
  image: string | null
  video?: string | null
}

type Props = {
  categories: Category[]
}

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

export default function FeaturedCategorySlider({ categories }: Props) {
  const n = categories.length
  if (n === 0) return null

  if (n === 1) {
    const cat = categories[0]
    return (
      <Link href={`/category/${cat.slug}`} className="group relative block w-full h-[60vh] md:h-[72vh] overflow-hidden bg-gray-100">
        {cat.video ? (
          <AutoplayVideo
            src={cat.video}
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: "auto" }}
          />
        ) : cat.image ? (
          <Image src={cat.image} alt={cat.name} fill priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="100vw" />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          <p className="text-white/70 text-xs uppercase tracking-[0.2em] mb-2">Kategori</p>
          <h3 className="text-white text-4xl md:text-6xl font-semibold tracking-tight mb-4">{cat.name}</h3>
          <span className="inline-flex items-center gap-2 text-white text-sm font-medium border-b border-white/50 pb-0.5 group-hover:border-white transition-colors">
            Koleksiyonu Keşfet →
          </span>
        </div>
      </Link>
    )
  }

  return <Slider categories={categories} />
}

function Slider({ categories }: { categories: Category[] }) {
  const n = categories.length

  // 2 leading + real items + 2 trailing clones
  const extended = [
    categories[wrap(n - 2, n)],
    categories[wrap(n - 1, n)],
    ...categories,
    categories[wrap(0, n)],
    categories[wrap(1, n)],
  ]
  const total = extended.length
  const OFFSET = 2

  const [pos, setPos] = useState(OFFSET)
  const [animate, setAnimate] = useState(true)
  const busy = useRef(false)

  const touchStartX = useRef<number | null>(null)
  const wheelCooldown = useRef(false)

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
    if (pos >= OFFSET + n) { setAnimate(false); setPos(pos - n) }
    else if (pos < OFFSET) { setAnimate(false); setPos(pos + n) }
  }

  function next() { goTo(pos + 1) }
  function prev() { goTo(pos - 1) }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) > 50) { if (delta < 0) next(); else prev() }
  }

  function onWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return
    if (wheelCooldown.current) return
    wheelCooldown.current = true
    setTimeout(() => { wheelCooldown.current = false }, 650)
    if (e.deltaX > 30) next()
    else if (e.deltaX < -30) prev()
  }

  const activeIndex = wrap(pos - OFFSET, n)
  const translateX = -(pos / total) * 100

  return (
    <div
      className="relative w-full h-[60vh] md:h-[72vh] overflow-hidden bg-gray-100 select-none"
      onWheel={onWheel}
    >

      {/* Track */}
      <div
        className="flex h-full"
        style={{
          width: `${total * 100}%`,
          transform: `translateX(${translateX}%)`,
          transition: animate ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
        }}
        onTransitionEnd={onTransitionEnd}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {extended.map((cat, i) => (
          <div key={i} style={{ width: `${100 / total}%` }} className="relative h-full shrink-0 overflow-hidden">
            {cat.video ? (
              <AutoplayVideo
                src={cat.video}
                style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: "auto" }}
              />
            ) : cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                priority={i === OFFSET}
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

            {/* Metin — tıklama sadece active slide'da çalışsın */}
            <Link
              href={`/category/${cat.slug}`}
              className="absolute inset-0 flex flex-col justify-end p-7 md:p-12 group"
              tabIndex={i - OFFSET === activeIndex ? 0 : -1}
            >
              <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.22em] mb-2 md:mb-3">
                Kategori
              </p>
              <h3 className="text-white text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-none mb-4 md:mb-6">
                {cat.name}
              </h3>
              <span className="inline-flex items-center gap-2 text-white/80 text-sm font-medium border-b border-white/40 pb-0.5 w-fit group-hover:text-white group-hover:border-white transition-colors duration-200">
                Koleksiyonu Keşfet →
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* Sol ok */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
        aria-label="Önceki"
      >
        <ChevronLeft size={20} strokeWidth={2} />
      </button>

      {/* Sağ ok */}
      <button
        type="button"
        onClick={next}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
        aria-label="Sonraki"
      >
        <ChevronRight size={20} strokeWidth={2} />
      </button>

      {/* Dot indikatörler */}
      <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {categories.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i + OFFSET)}
            className={`transition-all duration-300 ${
              activeIndex === i
                ? "w-6 md:w-8 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`${i + 1}. kategori`}
          />
        ))}
      </div>
    </div>
  )
}
