"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

type Props = {
  pageKey: string
}

type PageData = {
  key: string
  title: string
  content: string
}

export default function DynamicInfoPage({ pageKey }: Props) {
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPage() {
      try {
        const res = await fetch(`/api/site-pages/${pageKey}`, {
          cache: "no-store",
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Sayfa getirilemedi")
        }

        setPage(data)
      } catch (error) {
        console.error(error)
        setPage(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [pageKey])

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">
            {loading ? "Yükleniyor..." : page?.title || "Sayfa"}
          </span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          {loading ? (
            <p className="text-gray-500">İçerik yükleniyor...</p>
          ) : !page ? (
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