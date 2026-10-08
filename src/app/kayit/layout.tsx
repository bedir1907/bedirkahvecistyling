import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Üye Ol", true)

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
