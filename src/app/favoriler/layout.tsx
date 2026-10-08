import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Favorilerim", true)

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children
}
