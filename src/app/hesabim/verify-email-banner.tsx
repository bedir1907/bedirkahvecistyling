"use client"

import { useState } from "react"

export default function VerifyEmailBanner() {
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    try {
      setLoading(true)

      const res = await fetch("/api/customer/resend-verification", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Doğrulama e-postası gönderilemedi")
      }

      alert("Doğrulama e-postası tekrar gönderildi.")
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Doğrulama e-postası gönderilemedi"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-amber-900">
          E-posta adresin henüz doğrulanmadı
        </div>
        <div className="text-sm text-amber-800 mt-1">
          Hesabını daha güvenli hale getirmek için doğrulama mailini tekrar gönderebilirsin.
        </div>
      </div>

      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl bg-[#1C1C1E] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Gönderiliyor..." : "Doğrulama Mailini Gönder"}
      </button>
    </div>
  )
}