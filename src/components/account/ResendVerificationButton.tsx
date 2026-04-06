"use client"

import { useState } from "react"

export default function ResendVerificationButton() {
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
    <button
      type="button"
      onClick={handleResend}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-2xl bg-[#1C1C1E] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? "Gönderiliyor..." : "Tekrar Gönder"}
    </button>
  )
}