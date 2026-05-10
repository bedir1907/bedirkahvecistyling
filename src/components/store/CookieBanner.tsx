"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const COOKIE_KEY = "cookie_consent"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // localStorage'da onay yoksa göster
    try {
      const consent = localStorage.getItem(COOKIE_KEY)
      if (!consent) setVisible(true)
    } catch {
      // private browsing vb.
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(COOKIE_KEY, "accepted")
    } catch {}
    setVisible(false)
  }

  function decline() {
    try {
      localStorage.setItem(COOKIE_KEY, "declined")
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner-enter fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-white border border-black/10 rounded-3xl shadow-2xl px-5 py-5 md:px-7 md:py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 text-sm text-gray-700 leading-6">
          <span className="font-semibold text-black">Çerez Politikası</span>{" "}
          — Sitemizi daha iyi bir deneyim sunmak için çerezler kullanıyoruz.
          Devam ederek{" "}
          <Link
            href="/cerez-politikasi"
            className="underline hover:text-black transition"
          >
            Çerez Politikamızı
          </Link>{" "}
          kabul etmiş olursunuz.
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={decline}
            className="h-10 px-4 rounded-2xl border border-black/10 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={accept}
            className="h-10 px-5 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  )
}
