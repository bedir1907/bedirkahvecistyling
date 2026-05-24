"use client"

import Link from "next/link"
import { useState } from "react"

type Collection = {
  id: number
  name: string
  slug: string
  eyebrow: string | null
  description: string | null
  image: string | null
  buttonText: string | null
  buttonLink: string | null
  discount: number | null
  products: { id: number }[]
}

type Props = {
  collections: Collection[]
}

export default function CollectionSection({ collections }: Props) {
  const active = collections.filter((c) => c.products.length > 0)
  if (active.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-5">
      {active.map((col) => (
        <CollectionCard key={col.id} collection={col} />
      ))}
    </section>
  )
}

function CollectionCard({ collection }: { collection: Collection }) {
  const [hovered, setHovered] = useState(false)
  const href = collection.buttonLink || `/collections/${collection.slug}`
  const buttonLabel = collection.buttonText || "Koleksiyonu Gör"

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl bg-gray-100 aspect-16/7"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Görsel */}
      {collection.image ? (
        <img
          src={collection.image}
          alt={collection.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${hovered ? "scale-105" : "scale-100"}`}
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />

      {/* İndirim rozeti */}
      {collection.discount != null && (
        <div className="absolute top-5 right-5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wide z-10">
          %{collection.discount} İndirim
        </div>
      )}

      {/* İçerik — sol alt */}
      <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10 max-w-xl">
        {collection.eyebrow && (
          <p className="text-xs uppercase tracking-[0.22em] text-white/60 mb-2">
            {collection.eyebrow}
          </p>
        )}

        <h3 className="text-3xl md:text-4xl font-semibold text-white leading-tight tracking-tight drop-shadow-sm">
          {collection.name}
        </h3>

        {collection.description && (
          <p className={`text-white/75 text-sm mt-3 line-clamp-2 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-70"}`}>
            {collection.description}
          </p>
        )}

        <span
          className={`mt-5 self-start inline-flex items-center gap-2 text-sm font-medium bg-white text-black px-5 py-2.5 rounded-xl transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-90 translate-y-1"}`}
        >
          {buttonLabel} →
        </span>
      </div>
    </Link>
  )
}
