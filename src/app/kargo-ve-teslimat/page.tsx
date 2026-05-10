import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "Kargo ve Teslimat",
  description: "Bedir Kahveci Styling kargo ve teslimat bilgileri.",
}

export default function KargoVeTeslimatPage() {
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
          <p className="text-sm text-gray-500 mt-3">
            Siparişleriniz özenle hazırlanarak en kısa sürede kargoya verilmektedir.
          </p>

          {/* Özet kutular */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🚚", title: "3–7 İş Günü", sub: "Ortalama teslimat" },
              { icon: "📦", title: "Ücretsiz Kargo", sub: "Tüm siparişlerde" },
              { icon: "🔍", title: "Takip", sub: "SMS + e-posta" },
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
              <h2 className="text-xl font-semibold text-black mb-3">1. Sipariş Hazırlama Süreci</h2>
              <p>
                Ödemenizin onaylanmasının ardından siparişiniz en geç <strong className="text-black">1–2 iş günü</strong>{" "}
                içinde hazırlanarak kargo firmasına teslim edilir. Yoğun dönemlerde (kampanya, bayram öncesi vb.)
                bu süre 3 iş gününe uzayabilir; bu durumlarda sipariş e-postanızda bilgilendirme yapılır.
              </p>
              <p className="mt-3">
                Hafta sonu ve resmi tatillerde kargoya verme işlemi yapılmamaktadır; bu günlere
                denk gelen siparişler bir sonraki iş gününde işleme alınır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. Teslimat Süreleri</h2>
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
                      ["İstanbul", "1–3 iş günü", "Ücretsiz"],
                      ["Büyükşehirler", "2–4 iş günü", "Ücretsiz"],
                      ["Diğer İller", "3–6 iş günü", "Ücretsiz"],
                      ["Uzak/Köy Adresleri", "5–7 iş günü", "Ücretsiz"],
                    ].map(([bolge, sure, ucret]) => (
                      <tr key={bolge} className="even:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-black">{bolge}</td>
                        <td className="px-4 py-3 text-gray-600">{sure}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">{ucret}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Belirtilen süreler tahmini olup kargo firmasının operasyonel yoğunluğuna ve hava
                koşullarına göre değişkenlik gösterebilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Kargo Takibi</h2>
              <p>
                Siparişiniz kargoya verildiğinde, kayıtlı e-posta adresinize ve telefon numaranıza
                kargo takip numarası iletilir. Bu numara ile kargo firmasının web sitesi veya
                uygulaması üzerinden siparişinizi gerçek zamanlı olarak takip edebilirsiniz.
              </p>
              <p className="mt-3">
                Hesabınıza giriş yaparak <Link href="/siparislerim" className="underline hover:text-black transition">Siparişlerim</Link>{" "}
                sayfasından da sipariş durumunuzu görebilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Teslimat Sırasında Dikkat Edilmesi Gerekenler</h2>
              <ul className="space-y-2">
                {[
                  "Teslimat anında adresinizde bulunmanız veya yetkili birinin bulunması önerilir.",
                  "Kargo görevlisi tarafından bırakılan bildirime göre en yakın kargo şubesinden teslim alabilirsiniz.",
                  "Paket teslimatta hasar görmüş ise, teslim almadan önce kargo görevlisine tutanak tutturmanız ve paketi iade etmeniz önerilir. Tutanaksız teslim alınan paketler için kargo kaynaklı hasar talebi işletilemez.",
                  "Yanlış adres girişinden kaynaklanan teslimat sorunlarından Bedir Kahveci Styling sorumlu tutulamaz.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. Teslim Edilemeyen Paketler</h2>
              <p>
                Kargo firmasının birden fazla teslimat denemesine rağmen teslim edilemeyen paketler
                kargo şubesinde belirli süre bekletilir. Bu süre içinde teslim alınmayan paketler
                tarafımıza iade olarak döner. Bu durumda müşteri hizmetlerimiz sizinle iletişime
                geçer ve yeniden gönderim veya sipariş iptali seçenekleri sunulur.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">6. Yurt Dışı Teslimat</h2>
              <p>
                Şu anda yalnızca Türkiye genelinde teslimat yapılmaktadır. Yurt dışı teslimat
                hizmeti yakın dönemde hayata geçirilmesi planlanmaktadır.
              </p>
            </div>

            <div className="bg-black text-white rounded-2xl px-5 py-5">
              <p className="font-semibold mb-2">Kargo Sorunları İçin</p>
              <p className="text-sm text-white/80 leading-7">
                Kargo gecikmesi, hasar veya kayıp gibi durumlarda lütfen sipariş numaranızla
                birlikte bizimle iletişime geçin.
                <br />
                <a href="mailto:info@bedirkahveci.com" className="underline">info@bedirkahveci.com</a>
                {" "}— En geç 1 iş günü içinde yanıtlanır.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
