"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 mb-6">
          Bedir Kahveci Styling
        </p>
        <h1 className="text-5xl font-semibold tracking-tight mb-4">Bir hata oluştu</h1>
        <p className="text-gray-400 text-sm mb-10">
          Beklenmeyen bir sorun meydana geldi. Lütfen tekrar deneyin.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:opacity-90 transition"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-gray-200 text-black px-8 py-3.5 rounded-2xl text-sm font-medium hover:border-black transition"
          >
            Anasayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
