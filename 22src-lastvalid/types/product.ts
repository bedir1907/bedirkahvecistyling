export type Product = {
  id: number
  slug: string
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  description: string
  sizes: string[]
  colors: string[]
  stock: number
  featured: boolean
}
