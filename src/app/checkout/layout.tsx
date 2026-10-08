import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Ödeme", false)

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
