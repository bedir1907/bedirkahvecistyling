"use client"

import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"
import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/format"

type ShippingSettings = {
  fee: number
  freeAbove: number | null
}

export default function KargoVeTeslimatPage() {
  const [shipping, setShipping] = useState<ShippingSettings | null>(null)

  useEffect(() => {
    fetch("/api/shipping").then(r => r.json()).then(d => setShipping(d)).catch(() => {})
  }, [])

  const shippingText = shipping === null
    ? "Yükleniyor..."
    : shipping.fee === 0
      ? "Ücretsiz"
      : formatPrice(shipping.fee)

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Kargo ve Teslimat</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Müşteri Hizmetleri</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Kargo ve Teslimat</h1>

          {/* Özet kartlar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { icon: "🚚", title: "Teslimat Süresi", sub: "3–7 iş günü" },
              { icon: "📦", title: "Kargo Ücreti", sub: shippingText },
              { icon: "🔍", title: "Takip", sub: "SMS + E-posta" },
              { icon: "🇹🇷", title: "Türkiye Geneli", sub: "Her adrese teslimat" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-black/8 rounded-2xl px-4 py-4 text-center">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="font-semibold text-black text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">1. Kargo Ücreti</h2>
              {shipping === null ? (
                <p>Kargo ücreti bilgisi yükleniyor...</p>
              ) : shipping.fee === 0 ? (
                <p>Tüm siparişlerinizde kargo ücretsizdir.</p>
              ) : (
                <div className="space-y-2">
                  <p>
                    Sipariş başına kargo ücreti <strong className="text-black">{formatPrice(shipping.fee)}</strong>'dir.
                  </p>
                  {shipping.freeAbove && (
                    <p className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
                      🎉 <strong>{formatPrice(shipping.freeAbove)}</strong> ve üzeri siparişlerde kargo ücretsizdir!
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. Sipariş Hazırlama</h2>
              <p>
                Ödemenizin onaylanmasının ardından siparişiniz en geç <strong className="text-black">1–2 iş günü</strong>{" "}
                içinde hazırlanarak kargoya teslim edilir. Hafta sonu ve resmi tatillerde kargoya verme yapılmamaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Teslimat Süreleri</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-4 py-2.5 text-left rounded-tl-xl font-medium">Bölge</th>
                      <th className="px-4 py-2.5 text-left font-medium">Tahmini Süre</th>
                      <th className="px-4 py-2.5 text-left rounded-tr-xl font-medium">Kargo Ücreti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8">
                    {[
                      ["İstanbul", "1–3 iş günü"],
                      ["Büyükşehirler", "2–4 iş günü"],
                      ["Diğer İller", "3–6 iş günü"],
                      ["Uzak/Köy Adresleri", "5–7 iş günü"],
                    ].map(([bolge, sure]) => (
                      <tr key={bolge} className="even:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-black">{bolge}</td>
                        <td className="px-4 py-3 text-gray-600">{sure}</td>
                        <td className="px-4 py-3 text-gray-600">{shippingText}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Kargo Takibi</h2>
              <p>
                Siparişiniz kargoya verildiğinde e-posta ve SMS ile kargo takip numarası iletilir.
                Hesabınıza giriş yaparak{" "}
                <Link href="/siparislerim" className="underline hover:text-black transition">Siparişlerim</Link>{" "}
                sayfasından da durumu görebilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. Dikkat Edilmesi Gerekenler</h2>
              <ul className="space-y-2">
                {[
                  "Paket teslimatta hasar görmüş ise kargo görevlisine tutanak tutturmanız önerilir.",
                  "Yanlış adres girişinden kaynaklanan sorunlardan Bedir Kahveci Styling sorumlu tutulamaz.",
                  "Birden fazla teslimat denemesine rağmen teslim edilemeyen paketler iade olarak döner.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black text-white rounded-2xl px-5 py-5">
              <p className="font-semibold mb-2">Kargo Sorunları İçin</p>
              <p className="text-sm text-white/80 leading-7">
                <a href="mailto:info@bedirkahvecistyling.com" className="underline">info@bedirkahvecistyling.com</a>
                {" "}— Telefon: <a href="tel:+905531361261" className="underline">+90 553 136 12 61</a>
                <br />En geç 1 iş günü içinde yanıtlanır.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}