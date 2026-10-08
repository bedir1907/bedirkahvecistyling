/** Kategori/koleksiyon gridlerinde client tarafı sıralama (sunucu & client ortak, saf fonksiyon). */
export type ListingSort = "new" | "price-asc" | "price-desc"

export function sortListingProducts<T extends { id: number; price: number }>(products: T[], sort: ListingSort): T[] {
  return [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    return b.id - a.id
  })
}
