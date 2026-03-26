    "use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"

type Product = {
  id: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  hoverImage: string | null
}

export default function DiscountedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/products/discounted")
      const data = await res.json()
      setProducts(data)
    }

    fetchData()
  }, [])

 function next() {
  if (currentIndex >= products.length - 4) {
    setCurrentIndex(0)
  } else {
    setCurrentIndex((prev) => prev + 1)
  }
}

  function prev() {
  if (currentIndex === 0) {
    setCurrentIndex(products.length - 4)
  } else {
    setCurrentIndex((prev) => prev - 1)
  }
}
  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">İndirimdekiler</h2>

        <div className="flex gap-2">
          <button
            onClick={prev}
            className="border px-4 py-2 rounded hover:bg-black hover:text-white"
          >
            ←
          </button>

          <button
            onClick={next}
            className="border px-4 py-2 rounded hover:bg-black hover:text-white"
          >
            →
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
  className="flex transition-transform duration-500"
  style={{
    transform: `translateX(-${currentIndex * 25}%)`,
  }}
>
          {products.map((product) => (
            <div key={product.id} className="min-w-[25%] px-3">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}