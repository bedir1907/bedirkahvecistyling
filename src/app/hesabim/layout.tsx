import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Hesabım", false)

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
