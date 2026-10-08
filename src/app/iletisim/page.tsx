import type { Metadata } from "next"
import DynamicInfoPage from "@/components/store/DynamicInfoPage"
import { pageMetadata } from "@/lib/seo"

// İçerik admin'den düzenlenir; 60 sn ISR ile güncel tutulur.
export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: "İletişim",
  description:
    "Bedir Kahveci Styling iletişim bilgileri: sipariş, iade, değişim ve ürünlerle ilgili sorularınız için e-posta ve telefonla bize ulaşın.",
  path: "/iletisim",
})

export default function ContactPage() {
  return <DynamicInfoPage pageKey="contact" />
}
