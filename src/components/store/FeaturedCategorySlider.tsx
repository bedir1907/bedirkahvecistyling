"use client"

import Link from "next/link"
import Image from "next/image"

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
  if (categories.length === 0) {
    return <p className="text-gray-500">Henüz vitrine alınmış kategori yok.</p>
  }

  // 1 kategori → tam genişlik hero
  // 2 kategori → yan yana eşit
  // 3 kategori → ilki büyük, ikisi küçük
  // 4+ kategori → ilk ikisi büyük, kalanlar küçük grid

  if (categories.length === 1) {
    return <SingleHero category={categories[0]} />
  }

  if (categories.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} size="large" />
        ))}
      </div>
    )
  }

  if (categories.length === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:row-span-2">
          <CategoryCard category={categories[0]} size="large" tall />
        </div>
        <CategoryCard category={categories[1]} size="medium" />
        <CategoryCard category={categories[2]} size="medium" />
      </div>
    )
  }

  // 4+
  const [first, second, ...rest] = categories
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryCard category={first} size="large" />
        <CategoryCard category={second} size="large" />
      </div>
      <div className={`grid gap-4 grid-cols-2 ${rest.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {rest.map((cat) => (
          <CategoryCard key={cat.id} category={cat} size="small" />
        ))}
      </div>
    </div>
  )
}

// ── Tek büyük hero ────────────────────────────────────────────────────────────
function SingleHero({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block rounded-[28px] overflow-hidden bg-gray-100 min-h-[500px]"
    >
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-8 md:p-12">
        <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Kategori</p>
        <h3 className="text-white text-4xl md:text-5xl font-bold mb-4">{category.name}</h3>
        <span className="inline-flex items-center gap-2 text-white font-medium text-lg group-hover:gap-3 transition-all">
          Koleksiyonu Gör <span>→</span>
        </span>
      </div>
    </Link>
  )
}

// ── Kategori kartı ────────────────────────────────────────────────────────────
function CategoryCard({
  category,
  size,
  tall = false,
}: {
  category: Category
  size: "large" | "medium" | "small"
  tall?: boolean
}) {
  const heightClass = {
    large: tall ? "min-h-[500px]" : "min-h-[360px] md:min-h-[420px]",
    medium: "min-h-[260px] md:min-h-[300px]",
    small: "min-h-[200px] md:min-h-[240px]",
  }[size]

  const titleClass = {
    large: "text-3xl md:text-4xl",
    medium: "text-2xl md:text-3xl",
    small: "text-xl md:text-2xl",
  }[size]

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative block rounded-[24px] overflow-hidden bg-gray-100 ${heightClass} ${tall ? "h-full" : ""}`}
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

      {/* İçerik */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <h3 className={`text-white font-bold ${titleClass} mb-2 leading-tight`}>
          {category.name}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-white/80 text-sm font-medium group-hover:text-white group-hover:gap-2.5 transition-all duration-200">
          İncele <span className="text-base">→</span>
        </span>
      </div>

      {/* Üst etiket */}
      <div className="absolute top-4 left-4">
        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
          Koleksiyon
        </span>
      </div>
    </Link>
  )
}
