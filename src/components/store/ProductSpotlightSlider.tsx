"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatPrice } from "@/lib/format"

type Product = {
  id: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  href: string
}

type Props = {
  products: Product[]
}

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

// Each slide is 82vw wide; 9vw peek on each side
const SLIDE_VW = 82
const PEEK_VW = (100 - SLIDE_VW) / 2

export default function ProductSpotlightSlider({ products }: Props) {
  const n = products.length

  const extended = [
    products[wrap(n - 2, n)],
    products[wrap(n - 1, n)],
    ...products,
    products[wrap(0, n)],
    products[wrap(1, n)],
  ]
  const total = extended.length
  const OFFSET = 2

  const [pos, setPos] = useState(OFFSET)
  const [animate, setAnimate] = useState(true)
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

  // translateX: center the active slide with PEEK_VW visible on each side
  const tx = PEEK_VW - pos * SLIDE_VW

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* Track */}
      <div
        className="flex"
        style={{
          width: `${total * SLIDE_VW}vw`,
          transform: `translateX(${tx}vw)`,
          transition: animate ? "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {extended.map((product, i) => {
          const isActive = i - OFFSET === activeIndex
          const hasDiscount = product.oldPrice !== null && product.oldPrice > product.price
          const discountRate = hasDiscount
            ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
            : null

          return (
            <div
              key={i}
              style={{ width: `${SLIDE_VW}vw` }}
              className="shrink-0 px-2"
            >
              {/* Kart */}
              <div className={`transition-opacity duration-400 ${isActive ? "opacity-100" : "opacity-40"}`}>
                {/* Görsel */}
                <div className="relative w-full h-[48vh] md:h-[55vh] overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
                  )}
                  {discountRate && (
                    <div className="absolute top-3 left-3 bg-black text-white text-[11px] font-bold px-2.5 py-1 tracking-wide">
                      %{discountRate} İndirim
                    </div>
                  )}
                </div>

                {/* Bilgi */}
                <div className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    {product.category && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-1">
                        {product.category}
                      </p>
                    )}
                    <h3 className="text-base md:text-xl font-semibold tracking-tight leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm md:text-base font-semibold">
                        {formatPrice(product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs md:text-sm text-black/35 line-through">
                          {formatPrice(product.oldPrice!)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={product.href}
                    tabIndex={isActive ? 0 : -1}
                    className="shrink-0 self-start sm:self-end inline-flex items-center gap-1.5 text-sm font-medium border-b border-black/30 hover:border-black pb-0.5 transition whitespace-nowrap"
                  >
                    İncele →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sol ok */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-2 md:left-4 top-[38%] -translate-y-1/2 z-10 w-10 h-10 bg-white border border-black/10 shadow-sm flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
        aria-label="Önceki"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>

      {/* Sağ ok */}
      <button
        type="button"
        onClick={next}
        className="absolute right-2 md:right-4 top-[38%] -translate-y-1/2 z-10 w-10 h-10 bg-white border border-black/10 shadow-sm flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
        aria-label="Sonraki"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>

      {/* Dot indikatörler */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {products.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i + OFFSET)}
            className={`transition-all duration-300 ${
              activeIndex === i
                ? "w-6 md:w-8 h-1.5 bg-black"
                : "w-1.5 h-1.5 bg-black/20 hover:bg-black/40"
            }`}
            aria-label={`${i + 1}. ürün`}
          />
        ))}
      </div>
    </div>
  )
}
