import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "İade ve Değişim",
  description: "Bedir Kahveci Styling iade ve değişim koşulları.",
}

export default function IadeVeDegisimPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">İade ve Değişim</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Müşteri Hizmetleri</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">İade ve Değişim</h1>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "📅", title: "14 Gün", sub: "Cayma hakkı süresi" },
              { icon: "📦", title: "Ücretsiz Değişim", sub: "Beden / renk değişiminde" },
              { icon: "💳", title: "14 Gün İade", sub: "Ödeme yöntemine iade" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-black/8 rounded-2xl px-5 py-4 flex items-center gap-4">
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-black">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">1. İade Koşulları</h2>
              <ul className="space-y-2">
                {[
                  "Ürün kullanılmamış, yıkanmamış ve giyilmemiş olmalıdır.",
                  "Orijinal etiketleri çıkarılmamış ve ambalajı açılmamış olmalıdır.",
                  "Ürün, teslim aldığınız şekliyle iade edilmelidir.",
                  "Fatura veya sipariş numarasının iade paketiyle gönderilmesi işlemleri hızlandırır.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. İade Süreci</h2>
              <div className="space-y-3">
                {[
                  ["1. Bildirin", `14 gün içinde info@bedirkahvecistyling.com adresine sipariş numaranızı ve iade gerekçenizi bildirin.`],
                  ["2. Paketleyin", "Ürünü orijinal ambalajında veya uygun bir kutuda hasarsız biçimde paketleyin."],
                  ["3. Gönderin", "Tercih ettiğiniz kargo firmasıyla gönderin. İade kargo bedeli size aittir."],
                  ["4. Kontrol", "Ürün bize ulaştıktan sonra 2 iş günü içinde uygunluk kontrolü yapılır."],
                  ["5. Para İadesi", "Onaylanan iade, en geç 14 gün içinde ödeme yönteminize yapılır."],
                ].map(([adim, aciklama]) => (
                  <div key={adim} className="flex gap-4 bg-white border border-black/8 rounded-2xl px-5 py-4">
                    <span className="font-bold text-black shrink-0 w-24">{adim}</span>
                    <span className="text-sm">{aciklama}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Değişim</h2>
              <p>
                Farklı beden veya renk değişimi taleplerinde, stok durumuna göre ücretsiz değişim sağlanır.
                Değişim talebi için{" "}
                <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
                  info@bedirkahvecistyling.com
                </a>{" "}
                adresine sipariş numaranız ve talep ettiğiniz beden/renk bilgisiyle yazabilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Para İadesi Süreleri</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-4 py-2.5 text-left rounded-tl-xl font-medium">Ödeme Yöntemi</th>
                      <th className="px-4 py-2.5 text-left rounded-tr-xl font-medium">İade Süresi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8">
                    {[
                      ["Kredi Kartı", "3–10 iş günü (bankaya göre değişir)"],
                      ["Banka Kartı", "1–5 iş günü"],
                      ["Diğer Yöntemler", "En geç 14 gün"],
                    ].map(([yontem, sure]) => (
                      <tr key={yontem} className="even:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-black">{yontem}</td>
                        <td className="px-4 py-3 text-gray-600">{sure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-black text-white rounded-2xl px-5 py-5">
              <p className="font-semibold mb-2">İletişim</p>
              <p className="text-sm text-white/80 leading-7">
                İade veya değişim talepleriniz için:{" "}
                <a href="mailto:info@bedirkahvecistyling.com" className="underline">info@bedirkahvecistyling.com</a>
                <br />
                Telefon: <a href="tel:+905531361261" className="underline">+90 553 136 12 61</a>
                <br />
                Yanıt süresi: En geç 1 iş günü
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}