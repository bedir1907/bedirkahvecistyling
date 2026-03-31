"use client"

import { useEffect, useMemo, useState } from "react"
import ProductCard from "@/components/ProductCard"

type Product = {
  id: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  hoverImage: string | null
  colorName?: string
  category?: string
  href?: string
}

type Props = {
  title?: string
}

export default function DiscountedProducts({ title = "İndirimdekiler" }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/products/discounted")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "İndirimli ürünler alınamadı")
        }

        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const maxIndex = useMemo(() => {
    if (products.length <= 4) return 0
    return products.length - 4
  }, [products])

  function next() {
    if (products.length <= 4) return

    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  function prev() {
    if (products.length <= 4) return

    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
  }

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(0)
    }
  }, [currentIndex, maxIndex])

  if (loading) return null
  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-gray-500 mt-2">
            Fiyat avantajı sunan seçili ürünleri keşfet.
          </p>
        </div>

        {products.length > 4 ? (
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={prev}
              className="w-11 h-11 rounded-full border hover:bg-black hover:text-white transition"
              aria-label="Önceki ürünler"
            >
              ←
            </button>

            <button
              type="button"
              onClick={next}
              className="w-11 h-11 rounded-full border hover:bg-black hover:text-white transition"
              aria-label="Sonraki ürünler"
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${currentIndex * 25}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-full sm:min-w-[50%] lg:min-w-[25%] px-3"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                hoverImage={product.hoverImage}
                colorName={product.colorName}
                category={product.category}
                href={product.href}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}