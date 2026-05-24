"use client"

import { useState, useEffect, useRef } from "react"
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

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

export default function ProductSlider({ products }: { products: SliderProduct[] }) {
  const n = products.length
  if (n === 0) return null

  return (
    <>
      {/* Mobile: native snap scroll — shows 1 full card + peek of next */}
      <div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2">
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[73vw] sm:w-[46vw]">
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

      {/* Desktop (md+): static grid when ≤4, infinite slider when >4 */}
      {n <= IPVIEW ? (
        <div className="hidden md:flex gap-4">
          {products.map((p) => (
            <div key={p.id} className="w-[calc(25%-12px)] shrink-0">
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
      ) : (
        <div className="hidden md:block">
          <DesktopSlider products={products} />
        </div>
      )}
    </>
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
    if (pos >= OFFSET + n) {
      setAnimate(false)
      setPos(pos - n)
    } else if (pos < OFFSET) {
      setAnimate(false)
      setPos(pos + n)
    }
  }

  function next() { goTo(pos + 1) }
  function prev() { goTo(pos - 1) }

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
            width: `${(total / IPVIEW) * 100}%`,
            transform: `translateX(${translateX}%)`,
            transition: animate ? "transform 0.45s ease" : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((product, i) => (
            <div
              key={i}
              style={{ width: `${100 / total}%` }}
              className="px-2"
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
          ))}
        </div>
      </div>
    </div>
  )
}
