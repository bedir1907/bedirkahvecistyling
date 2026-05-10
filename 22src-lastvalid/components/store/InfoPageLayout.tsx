import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

type InfoPageLayoutProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export default function InfoPageLayout({
  title,
  description,
  children,
}: InfoPageLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">{title}</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            {title}
          </h1>

          {description ? (
            <p className="text-gray-500 mt-4 leading-7 max-w-2xl">
              {description}
            </p>
          ) : null}

          <div className="mt-10 prose prose-neutral max-w-none prose-headings:font-medium prose-p:text-gray-700 prose-li:text-gray-700">
            {children}
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}