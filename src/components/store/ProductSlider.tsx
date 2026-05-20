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
}

// 4 visible items per view → 4 leading + 4 trailing clones
const IPVIEW = 4
const OFFSET = IPVIEW

function wrap(i: number, n: number) {
  return ((i % n) + n) % n
}

export default function ProductSlider({ products }: { products: SliderProduct[] }) {
  const n = products.length
  if (n === 0) return null

  if (n <= IPVIEW) {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {products.map((p) => (
          <div key={p.id} className="min-w-[220px] w-[calc(25%-12px)] shrink-0">
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
            />
          </div>
        ))}
      </div>
    )
  }

  return <Slider products={products} />
}

function Slider({ products }: { products: SliderProduct[] }) {
  const n = products.length

  // OFFSET leading clones + real items + IPVIEW trailing clones
  const extended = [
    ...Array.from({ length: OFFSET }, (_, i) => products[wrap(n - OFFSET + i, n)]),
    ...products,
    ...Array.from({ length: IPVIEW }, (_, i) => products[wrap(i, n)]),
  ]
  const total = extended.length // n + 8

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
        className="hidden md:flex absolute left-3 top-1/2 -translate-y-6 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg items-center justify-center transition hover:bg-black hover:text-white hover:border-black"
        aria-label="Önceki"
      >
        <ChevronLeft size={19} strokeWidth={2.2} />
      </button>

      <button
        type="button"
        onClick={next}
        className="hidden md:flex absolute right-3 top-1/2 -translate-y-6 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-lg items-center justify-center transition hover:bg-black hover:text-white hover:border-black"
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
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
