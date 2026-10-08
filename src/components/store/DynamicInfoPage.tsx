import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"
import { prisma } from "@/lib/prisma"

type Props = {
  pageKey: string
}

// Sunucuda render edilir: başlık (h1) ve içerik ilk HTML'de gelir (arama motorları için).
async function getPage(key: string) {
  try {
    return await prisma.sitePage.findUnique({
      where: { key },
      select: { title: true, content: true },
    })
  } catch (error) {
    console.error("Site sayfası getirilemedi:", error)
    return null
  }
}

export default async function DynamicInfoPage({ pageKey }: Props) {
  const page = await getPage(pageKey)

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black" aria-current="page">
            {page?.title || "Sayfa"}
          </span>
        </nav>

        <div className="border border-black/10 bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          {!page ? (
            <p className="text-gray-500">Sayfa içeriği bulunamadı.</p>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
                {page.title}
              </h1>

              <div className="mt-10 space-y-5 text-gray-700 leading-7 whitespace-pre-line">
                {page.content}
              </div>
            </>
          )}
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}
