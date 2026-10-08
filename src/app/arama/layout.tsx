import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Arama Sonuçları", true)

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
