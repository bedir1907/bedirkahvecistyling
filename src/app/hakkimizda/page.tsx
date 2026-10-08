import type { Metadata } from "next"
import DynamicInfoPage from "@/components/store/DynamicInfoPage"
import { pageMetadata } from "@/lib/seo"

// İçerik admin'den düzenlenir; 60 sn ISR ile güncel tutulur.
export const revalidate = 60

export const metadata: Metadata = pageMetadata({
  title: "Hakkımızda",
  description:
    "Bedir Kahveci Styling hakkında: modern erkek giyimde sade, güçlü ve kaliteli parçalar sunan markamızın hikâyesi, değerleri ve stil anlayışı.",
  path: "/hakkimizda",
})

export default function AboutPage() {
  return <DynamicInfoPage pageKey="about" />
}
