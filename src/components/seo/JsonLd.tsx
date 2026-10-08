import { serializeJsonLd } from "@/lib/seo"

type Props = {
  data: unknown
}

/** Yapılandırılmış veri (schema.org JSON-LD) çıktısı. */
export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
