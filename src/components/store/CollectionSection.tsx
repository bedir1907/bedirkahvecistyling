"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Collection = {
  id: number
  name: string
  slug: string
  eyebrow: string | null
  description: string | null
  image: string | null
  video: string | null
  buttonText: string | null
  buttonLink: string | null
  discount: number | null
  products: { id: number }[]
}

type Props = {
  collections: Collection[]
}

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

export default function CollectionSection({ collections }: Props) {
  const active = collections.filter((c) => c.products.length > 0)
  if (active.length === 0) return null

  if (active.length === 1) {
    return (
      <section className="py-6 md:py-10">
        <CollectionSlide collection={active[0]} />
      </section>
    )
  }

  return (
    <section className="py-6 md:py-10">
      <Slider collections={active} />
    </section>
  )
}

function CollectionSlide({ collection }: { collection: Collection }) {
  const [hovered, setHovered] = useState(false)
  const href = collection.buttonLink || `/collections/${collection.slug}`
  const buttonLabel = collection.buttonText || "Koleksiyonu Gör"

  return (
    <Link
      href={href}
      className="group relative block w-full h-[60vh] md:h-[72vh] overflow-hidden bg-gray-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {collection.video ? (
        <video
          src={collection.video}
          autoPlay muted loop playsInline
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "100%",
            height: "auto",
          }}
        />
      ) : collection.image ? (
        <img
          src={collection.image}
          alt={collection.name}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: `translateY(-50%) ${hovered ? "scale(1.04)" : "scale(1)"}`,
            width: "100%",
            height: "auto",
            transition: "transform 0.7s ease",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

      {collection.discount != null && (
        <div className="absolute top-5 right-5 bg-black text-white text-xs font-bold px-3 py-1.5 tracking-wide z-10">
          %{collection.discount} İndirim
        </div>
      )}

      <div className="absolute bottom-0 left-0 p-7 md:p-12 max-w-xl">
        {collection.eyebrow && (
          <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.22em] mb-2 md:mb-3">
            {collection.eyebrow}
          </p>
        )}
        <h3 className="text-white text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-none mb-3 md:mb-4">
          {collection.name}
        </h3>
        {collection.description && (
          <p className={`text-white/75 text-sm mb-5 line-clamp-2 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-70"}`}>
            {collection.description}
          </p>
        )}
        <span className={`inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-5 py-2.5 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-90 translate-y-1"}`}>
          {buttonLabel} →
        </span>
      </div>
    </Link>
  )
}

function Slider({ collections }: { collections: Collection[] }) {
  const n = collections.length

  const extended = [
    collections[wrap(n - 2, n)],
    collections[wrap(n - 1, n)],
    ...collections,
    collections[wrap(0, n)],
    collections[wrap(1, n)],
  ]
  const total = extended.length
  const OFFSET = 2

  const [pos, setPos] = useState(OFFSET)
  const [animate, setAnimate] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
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
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
      >
        {extended.map((col, i) => {
          const href = col.buttonLink || `/collections/${col.slug}`
          const buttonLabel = col.buttonText || "Koleksiyonu Gör"
          const isHovered = hoveredIndex === i

          return (
            <div
              key={i}
              style={{ width: `${100 / total}%` }}
              className="relative h-full shrink-0 overflow-hidden"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {col.video ? (
                <video
                  src={col.video}
                  autoPlay muted loop playsInline
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "100%",
                    height: "auto",
                  }}
                />
              ) : col.image ? (
                <img
                  src={col.image}
                  alt={col.name}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: `translateY(-50%) ${isHovered ? "scale(1.04)" : "scale(1)"}`,
                    width: "100%",
                    height: "auto",
                    transition: "transform 0.7s ease",
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

              {col.discount != null && (
                <div className="absolute top-5 right-5 bg-black text-white text-xs font-bold px-3 py-1.5 tracking-wide z-10">
                  %{col.discount} İndirim
                </div>
              )}

              {/* Tüm görseli tıklanabilir yapan şeffaf katman */}
              <Link
                href={href}
                className="absolute inset-0 z-1"
                tabIndex={-1}
                aria-hidden="true"
              />

              <Link
                href={href}
                className="absolute bottom-0 left-0 p-7 md:p-12 max-w-xl block z-2"
                tabIndex={i - OFFSET === activeIndex ? 0 : -1}
              >
                {col.eyebrow && (
                  <p className="text-white/60 text-[10px] md:text-xs uppercase tracking-[0.22em] mb-2 md:mb-3">
                    {col.eyebrow}
                  </p>
                )}
                <h3 className="text-white text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-none mb-3 md:mb-4">
                  {col.name}
                </h3>
                {col.description && (
                  <p className={`text-white/75 text-sm mb-5 line-clamp-2 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-70"}`}>
                    {col.description}
                  </p>
                )}
                <span className={`inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-5 py-2.5 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-90 translate-y-1"}`}>
                  {buttonLabel} →
                </span>
              </Link>
            </div>
          )
        })}
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
        {collections.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i + OFFSET)}
            className={`transition-all duration-300 ${
              activeIndex === i
                ? "w-6 md:w-8 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`${i + 1}. koleksiyon`}
          />
        ))}
      </div>

    </div>
  )
}
