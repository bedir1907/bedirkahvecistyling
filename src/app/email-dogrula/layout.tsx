import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("E-posta Doğrulama", false)

export default function EmailVerifyLayout({ children }: { children: React.ReactNode }) {
  return children
}
