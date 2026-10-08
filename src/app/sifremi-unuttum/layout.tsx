import type { Metadata } from "next"
import { noIndexMetadata } from "@/lib/seo"

// Özel/işlem sayfası: arama motorlarında indekslenmez.
export const metadata: Metadata = noIndexMetadata("Şifremi Unuttum", false)

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
