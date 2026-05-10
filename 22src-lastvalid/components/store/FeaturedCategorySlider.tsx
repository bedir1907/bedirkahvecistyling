"use client"

import Link from "next/link"
import { useState } from "react"

type Category = {
  id: number
  name: string
  slug: string
  image: string | null
}

type Props = {
  categories: Category[]
}

export default function FeaturedCategorySlider({ categories }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)

  function goPrev() {
    if (categories.length === 0) return

    setCurrentIndex((prev) =>
      prev === 0 ? categories.length - 1 : prev - 1
    )
  }

  function goNext() {
    if (categories.length === 0) return

    setCurrentIndex((prev) =>
      prev === categories.length - 1 ? 0 : prev + 1
    )
  }

  if (categories.length === 0) {
    return <p className="text-gray-500">Henüz vitrine alınmış kategori yok.</p>
  }

  const item = categories[currentIndex]

  return (
    <div className="relative">
      <div className="absolute right-0 -top-20 flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="w-12 h-12 rounded-full border bg-white shadow flex items-center justify-center hover:bg-gray-50 text-lg"
        >
          ←
        </button>

        <button
          type="button"
          onClick={goNext}
          className="w-12 h-12 rounded-full border bg-white shadow flex items-center justify-center hover:bg-gray-50 text-lg"
        >
          →
        </button>
      </div>

      <Link
        href={`/category/${item.slug}`}
        className="group block border rounded-[28px] overflow-hidden bg-white hover:shadow-xl transition"
      >
        <div className="grid md:grid-cols-2 min-h-[420px]">
          <div
            className="bg-gray-100 min-h-[320px] md:min-h-full"
            style={
              item.image
                ? {
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />

          <div className="flex items-center">
            <div className="p-10 md:p-16">
             

              <h3 className="text-4xl md:text-5xl font-bold mb-5">
                {item.name}
              </h3>

              <p className="text-lg md:text-xl text-gray-600 leading-8 mb-8 max-w-xl">
                Sezonun dikkat çeken parçalarını keşfet. Modern çizgiler ve güçlü
                stil detaylarıyla öne çıkan koleksiyon.
              </p>

              <span className="inline-flex items-center gap-2 text-lg font-medium">
                Koleksiyonu Gör
                <span className="group-hover:translate-x-1 transition">→</span>
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 mt-6">
        {categories.map((category, index) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              currentIndex === index
                ? "w-10 bg-black"
                : "w-2.5 bg-gray-300"
            }`}
            aria-label={category.name}
          />
        ))}
      </div>
    </div>
  )
}