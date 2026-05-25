"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type EditorialBanner = {
  title: string
  eyebrow: string
  description: string
  href: string
  image: string | null
}

type Props = {
  banners: EditorialBanner[]
}

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

export default function EditorialBanners({ banners }: Props) {
  if (banners.length === 0) return null
  if (banners.length === 1) return <SingleBanner banner={banners[0]} />
  return <Slider banners={banners} />
}

function SingleBanner({ banner }: { banner: EditorialBanner }) {
  const [hovered, setHovered] = useState(false)
  return (
    <section className="py-6 md:py-10">
      <Link
        href={banner.href}
        className="relative block w-full h-[60vh] md:h-[72vh] overflow-hidden bg-gray-100"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${hovered ? "scale-[1.04]" : "scale-100"}`}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 p-7 md:p-12 max-w-xl">
          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.22em] mb-2 md:mb-3">
            {banner.eyebrow}
          </p>
          <h3 className="text-white text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-none mb-3 md:mb-4">
            {banner.title}
          </h3>
          <p className={`text-white/75 text-sm mb-5 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-70"}`}>
            {banner.description}
          </p>
          <span className={`inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-5 py-2.5 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-90 translate-y-1"}`}>
            Tümünü Gör →
          </span>
        </div>
      </Link>
    </section>
  )
}

function Slider({ banners }: { banners: EditorialBanner[] }) {
  const n = banners.length
  const extended = [
    banners[wrap(n - 2, n)],
    banners[wrap(n - 1, n)],
    ...banners,
    banners[wrap(0, n)],
    banners[wrap(1, n)],
  ]
  const total = extended.length
  const OFFSET = 2

  const [pos, setPos] = useState(OFFSET)
  const [animate, setAnimate] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const busy = useRef(false)
  const touchStartX = useRef<number | null>(null)
  const wheelCooldown = useRef(false)

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
    <section className="py-6 md:py-10">
      <div
        className="relative w-full h-[60vh] md:h-[72vh] overflow-hidden bg-gray-100 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        <div
          className="flex h-full"
          style={{
            width: `${total * 100}%`,
            transform: `translateX(${translateX}%)`,
            transition: animate ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((banner, i) => {
            const isHovered = hoveredIndex === i
            return (
              <div
                key={i}
                style={{ width: `${100 / total}%` }}
                className="relative h-full shrink-0"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-[1.04]" : "scale-100"}`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
                <Link
                  href={banner.href}
                  className="absolute bottom-0 left-0 p-7 md:p-12 max-w-xl block"
                  tabIndex={i - OFFSET === activeIndex ? 0 : -1}
                >
                  <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.22em] mb-2 md:mb-3">
                    {banner.eyebrow}
                  </p>
                  <h3 className="text-white text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-none mb-3 md:mb-4">
                    {banner.title}
                  </h3>
                  <p className={`text-white/75 text-sm mb-5 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-70"}`}>
                    {banner.description}
                  </p>
                  <span className={`inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-5 py-2.5 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-90 translate-y-1"}`}>
                    Tümünü Gör →
                  </span>
                </Link>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={prev}
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
          aria-label="Önceki"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
          aria-label="Sonraki"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>

        <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i + OFFSET)}
              className={`transition-all duration-300 ${
                activeIndex === i
                  ? "w-6 md:w-8 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`${i + 1}. bölüm`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
