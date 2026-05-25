"use client"

import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard from "@/components/ProductCard"

type CardColor = { id: number; color: string | null; image: string }

export type SliderProduct = {
  id: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  colorName: string
  category: string
  href: string
  colors: CardColor[]
  collectionDiscount?: number | null
}

const IPVIEW = 4
const OFFSET = IPVIEW
const CARD_VW = 22
const PEEK_VW = (100 - CARD_VW * IPVIEW) / 2 // 6vw each side

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

export default function ProductSlider({ products }: { products: SliderProduct[] }) {
  const n = products.length
  if (n === 0) return null

  return (
    <>
      {/* Mobile: native snap scroll */}
      <div className="md:hidden overflow-hidden">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pl-[9vw] pb-2">
          {products.map((p) => (
            <div key={p.id} className="snap-center shrink-0 w-[82vw] sm:w-[46vw]">
              <ProductCard
                id={p.id}
                name={p.name}
                price={p.price}
                oldPrice={p.oldPrice}
                image={p.image}
                href={p.href}
                colorName={p.colorName}
                category={p.category}
                colors={p.colors}
                collectionDiscount={p.collectionDiscount}
              />
            </div>
          ))}
          <div className="shrink-0 w-[9vw]" aria-hidden="true" />
        </div>
      </div>

      {/* Desktop: peek carousel */}
      <div className="hidden md:block">
        {n <= IPVIEW ? (
          <StaticGrid products={products} />
        ) : (
          <DesktopSlider products={products} />
        )}
      </div>
    </>
  )
}

function StaticGrid({ products }: { products: SliderProduct[] }) {
  return (
    <div className="flex gap-4 px-6">
      {products.map((p) => (
        <div key={p.id} className="flex-1 min-w-0">
          <ProductCard
            id={p.id}
            name={p.name}
            price={p.price}
            oldPrice={p.oldPrice}
            image={p.image}
            href={p.href}
            colorName={p.colorName}
            category={p.category}
            colors={p.colors}
            collectionDiscount={p.collectionDiscount}
          />
        </div>
      ))}
    </div>
  )
}

function DesktopSlider({ products }: { products: SliderProduct[] }) {
  const n = products.length

  const extended = [
    ...Array.from({ length: OFFSET }, (_, i) => products[wrap(n - OFFSET + i, n)]),
    ...products,
    ...Array.from({ length: IPVIEW }, (_, i) => products[wrap(i, n)]),
  ]
  const total = extended.length

  const [pos, setPos] = useState(OFFSET)
  const [animate, setAnimate] = useState(false)
  const busy = useRef(false)
  const touchStartX = useRef<number | null>(null)
  const wheelCooldown = useRef(false)

  function goTo(newPos: number) {
    if (busy.current) return
    busy.current = true
    setAnimate(true)
    setPos(newPos)
  }

  function onTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== "transform") return
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

  const tx = PEEK_VW - pos * CARD_VW

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <div
        className="flex"
        style={{
          width: `${total * CARD_VW}vw`,
          transform: `translateX(${tx}vw)`,
          transition: animate ? "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {extended.map((product, i) => {
          const inView = i >= pos && i < pos + IPVIEW
          return (
          <div
            key={i}
            style={{ width: `${CARD_VW}vw`, opacity: inView ? 1 : 0.5, transition: "opacity 0.3s" }}
            className="shrink-0 px-2"
          >
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              oldPrice={product.oldPrice}
              image={product.image}
              href={product.href}
              colorName={product.colorName}
              category={product.category}
              colors={product.colors}
              collectionDiscount={product.collectionDiscount}
            />
          </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-2 md:left-4 top-[38%] -translate-y-1/2 z-10 w-10 h-10 bg-white border border-black/10 shadow-sm flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
        aria-label="Önceki"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={next}
        className="absolute right-2 md:right-4 top-[38%] -translate-y-1/2 z-10 w-10 h-10 bg-white border border-black/10 shadow-sm flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors"
        aria-label="Sonraki"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>
    </div>
  )
}
