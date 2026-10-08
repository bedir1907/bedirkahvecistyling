import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Sepetim", false)

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
