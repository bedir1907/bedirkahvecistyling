"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

function getErrorMessage(reason: string | null): string {
  switch (reason) {
    case "FAILURE":
      return "Ödeme işlemi başarısız oldu. Kart bilgilerinizi kontrol edip tekrar deneyin."
    case "no-token":
      return "Geçersiz ödeme oturumu. Lütfen checkout sayfasına dönüp tekrar deneyin."
    case "callback-error":
      return "Ödeme doğrulanırken bir hata oluştu. Sipariş durumunuzu kontrol edin veya bize ulaşın."
    case "CANCEL":
      return "Ödeme iptal edildi. İstediğiniz zaman tekrar deneyebilirsiniz."
    case "ERROR":
      return "Ödeme sisteminde bir hata oluştu. Lütfen birkaç dakika sonra tekrar deneyin."
    default:
      return "Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin."
  }
}

export default function CheckoutFailClient() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")
  const orderNumber = searchParams.get("orderNumber")
  const errorMessage = getErrorMessage(reason)

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-black/10 rounded-[28px] p-8 md:p-10 text-center">

          {/* Hata ikonu */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
            Ödeme Sonucu
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Ödeme Başarısız
          </h1>

          <p className="text-gray-500 leading-7 text-sm mb-6">
            {errorMessage}
          </p>

          {orderNumber && (
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-black/8 rounded-2xl px-4 py-2.5 mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Sipariş No</span>
              <span className="font-semibold text-black text-sm">{orderNumber}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/checkout"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Tekrar Dene
            </Link>
            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-black/10 px-6 py-3 text-sm font-medium hover:bg-gray-50 transition"
            >
              Sepete Dön
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Sorun devam ederse{" "}
            <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
              info@bedirkahvecistyling.com
            </a>{" "}
            adresine yazabilirsiniz.
          </p>

        </div>
      </div>
    </main>
  )
}