import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Siparişlerim", false)

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children
}
