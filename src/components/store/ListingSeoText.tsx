import { textToParagraphs } from "@/lib/seo"

type Props = {
  title: string
  text: string | null | undefined
}

/** Kategori/koleksiyon sayfasının altındaki açıklama (SEO) metni. Admin'den düz metin olarak girilir. */
export default function ListingSeoText({ title, text }: Props) {
  const paragraphs = textToParagraphs(text)
  if (paragraphs.length === 0) return null

  return (
    <section className="border-t border-black/5 bg-[#f7f7f5]">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-5">{title}</h2>
        <div className="space-y-4 text-[15px] md:text-base leading-7 text-gray-600">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
