import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

// page.tsx bir client component olduğu için metadata burada tanımlanır.
export const metadata: Metadata = pageMetadata({
  title: "Kargo ve Teslimat",
  description:
    "Bedir Kahveci Styling kargo ve teslimat bilgileri: Türkiye geneli 3–7 iş günü teslimat, kargo ücreti, sipariş takibi ve teslimat süreci hakkında detaylar.",
  path: "/kargo-ve-teslimat",
})

export default function KargoVeTeslimatLayout({ children }: { children: React.ReactNode }) {
  return children
}
