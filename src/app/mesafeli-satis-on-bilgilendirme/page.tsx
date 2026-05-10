import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "Mesafeli Satış Ön Bilgilendirme Formu",
  description: "Bedir Kahveci Styling mesafeli satış ön bilgilendirme formu.",
}

export default function OnBilgilendirmePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Ön Bilgilendirme Formu</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Yasal Belge</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Mesafeli Satış<br />Ön Bilgilendirme Formu
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
            Madde 5 kapsamında hazırlanmıştır. Son güncelleme: Mayıs 2025
          </p>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            {/* Satıcı */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">1. Satıcı Bilgileri</h2>
              <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 text-sm space-y-2">
                {[
                  ["Unvan", "Bedir Kahveci Styling"],
                  ["Adres", "[Şirket adresi]"],
                  ["E-posta", "info@bedirkahveci.com"],
                  ["Telefon", "[Telefon numarası]"],
                  ["Web Sitesi", "www.bedirkahveci.com"],
                  ["Vergi Dairesi / No", "[Vergi dairesi adı] / [Vergi numarası]"],
                  ["MERSİS No", "[MERSİS numarası — varsa]"],
                ].map(([label, val]) => (
                  <p key={label}>
                    <span className="font-medium text-black w-44 inline-block">{label}</span>
                    <span className="text-gray-600">{val}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Ürün */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. Ürün / Hizmet Bilgisi</h2>
              <p>
                Satın alınmak istenen ürünlerin temel nitelikleri (beden, renk, materyal, model adı),
                birim satış fiyatı (KDV dahil, TL), toplam sipariş tutarı ve kargo ücreti (varsa)
                sipariş özeti ekranında ayrıntılı olarak gösterilmektedir.
              </p>
              <p className="mt-3">
                Ürünler; giyim kategorisinde erkek ve/veya unisex tekstil ürünleri olup doğal ve/veya
                sentetik hammaddelerden üretilmiş olabilir. Bakım talimatları ürün etiketlerinde yer alır.
              </p>
            </div>

            {/* Fiyat */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Toplam Fiyat</h2>
              <p>
                Ödenecek toplam tutar (ürün bedeli + kargo dahil KDV) ödeme sayfasında onaylanmadan
                önce Alıcı'ya açıkça gösterilir. Fiyat değişiklikleri onaylanmış siparişleri etkilemez.
              </p>
            </div>

            {/* Ödeme */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Ödeme Yöntemi</h2>
              <p>
                Ödemeler; kredi kartı, banka kartı ve Iyzico'nun desteklediği diğer ödeme yöntemleriyle
                3D Secure güvencesi altında gerçekleştirilmektedir. Kart bilgileri Satıcı tarafından
                saklanmaz. Sipariş onaylanmadan ödeme çekilmez; ödeme ancak sipariş onayı ile birlikte alınır.
              </p>
            </div>

            {/* Teslimat */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. Teslimat Koşulları</h2>
              <div className="space-y-3">
                {[
                  ["Teslimat Süresi", "Ödeme onayından itibaren en geç 30 iş günü; olağan durumlarda 3–7 iş günü"],
                  ["Teslimat Adresi", "Sipariş formunda Alıcı'nın bildirdiği adres"],
                  ["Kargo Ücreti", "Sipariş özeti ekranında gösterilmektedir; kampanya dönemlerinde ücretsiz kargo uygulanabilir"],
                  ["Kısmi Teslimat", "Stok yetersizliği durumunda parçalı teslimat yapılabilir; Alıcı önceden bilgilendirilir"],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col md:flex-row md:gap-4 border-b border-black/6 pb-3 last:border-0 last:pb-0">
                    <span className="font-medium text-black md:w-44 shrink-0">{label}</span>
                    <span className="text-gray-600">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cayma */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">6. Cayma Hakkı</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-900 text-sm mb-4">
                <strong>Önemli:</strong> Alıcı, malı teslim aldığı tarihten itibaren{" "}
                <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin
                ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
              </div>
              <p>
                Cayma bildirimi; e-posta (
                <a href="mailto:iade@bedirkahveci.com" className="underline hover:text-black transition">
                  iade@bedirkahveci.com
                </a>
                ) veya{" "}
                <Link href="/iletisim" className="underline hover:text-black transition">iletişim formu</Link>{" "}
                aracılığıyla yapılabilir. Bildirim tarihinin ispatı Alıcı'ya aittir.
              </p>
              <p className="mt-3">
                Cayma hakkının kullanılması durumunda Alıcı, ürünü 10 gün içinde iade eder;
                Satıcı da iade bedelini malın ulaşmasından itibaren 14 gün içinde iade eder.
                İade kargo bedeli Alıcı'ya aittir (aksini belirten kampanya dönemleri hariç).
              </p>
            </div>

            {/* İstisnalar */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">7. Cayma Hakkı İstisnaları</h2>
              <p className="mb-3">Aşağıdaki durumlarda cayma hakkı kullanılamaz:</p>
              <ul className="space-y-2">
                {[
                  "Alıcı'ya özel üretilen veya kişiselleştirilen ürünler",
                  "Hijyen ve sağlık gerekçesiyle ambalajı açıldıktan sonra iade edilemeyen ürünler",
                  "Niteliği itibarıyla çabuk bozulabilen veya son kullanma tarihi geçme ihtimali olan ürünler",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Garanti */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">8. Yasal Garanti</h2>
              <p>
                Tüm ürünler 6502 sayılı TKHK kapsamında <strong className="text-black">2 (iki) yıl</strong> yasal
                garantiye tabidir. Ayıplı mal teslimi halinde Alıcı; sözleşmeden dönme, bedel indirimi,
                ücretsiz onarım veya ayıpsız misliyle değişim haklarından birini talep edebilir.
              </p>
            </div>

            {/* Uyuşmazlık */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">9. Şikayet ve Uyuşmazlık</h2>
              <p>
                Şikayetleriniz için öncelikle{" "}
                <a href="mailto:info@bedirkahveci.com" className="underline hover:text-black transition">
                  info@bedirkahveci.com
                </a>{" "}
                adresine başvurabilirsiniz. Çözüme kavuşturulamayan uyuşmazlıklarda,
                yasal sınırlar dahilinde <strong className="text-black">Tüketici Hakem Heyeti</strong> veya
                yetkili <strong className="text-black">Tüketici Mahkemeleri</strong>'ne başvurabilirsiniz.
                Online uyuşmazlık çözümü için:{" "}
                <a
                  href="https://tuketici.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black transition"
                >
                  tuketici.gov.tr
                </a>
              </p>
            </div>

            {/* Onay */}
            <div className="bg-black text-white rounded-2xl px-5 py-5 text-sm leading-7">
              <p className="font-semibold text-base mb-2">Alıcı Onayı</p>
              <p>
                Alıcı, ödeme adımında "Siparişi Tamamla" butonuna tıklamadan önce bu formu
                okuduğunu ve içeriğini anladığını kabul etmiş sayılır. İşbu form, Mesafeli
                Sözleşmeler Yönetmeliği'nin 5. maddesi uyarınca sözleşme kurulmadan önce
                tüketiciye sunulmuş ve kalıcı veri saklayıcısı (e-posta) aracılığıyla
                teslim edilmiştir.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
