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
            Mesafeli Satış Ön Bilgilendirme Formu
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            6502 sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği Madde 5 kapsamında hazırlanmıştır. Son güncelleme: Mayıs 2025
          </p>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            <div>
              <h2 className="text-xl font-semibold text-black mb-4">1. Satıcı Bilgileri</h2>
              <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 text-sm space-y-2">
                {[
                  ["Unvan", "Bedir Kahveci Styling"],
                  ["Adres", "Yeniköy Mah. Amiral Şükrü Okan Cad. Altay Apartmanı No:26, Tirebolu / Giresun 28500"],
                  ["Vergi Dairesi / No", "Tirebolu Vergi Dairesi / 4880688583"],
                  ["Telefon", "+90 553 136 12 61"],
                  ["E-posta", "info@bedirkahvecistyling.com"],
                  ["Web Sitesi", "www.bedirkahvecistyling.com"],
                ].map(([label, val]) => (
                  <p key={label}>
                    <span className="font-medium text-black w-44 inline-block">{label}</span>
                    <span className="text-gray-600">{val}</span>
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. Ürün / Hizmet Bilgisi</h2>
              <p>
                Satın alınmak istenen ürünlerin temel nitelikleri, birim satış fiyatı (KDV dahil, TL),
                toplam sipariş tutarı ve kargo ücreti sipariş özeti ekranında gösterilmektedir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Toplam Fiyat</h2>
              <p>
                Ödenecek toplam tutar ödeme sayfasında onaylanmadan önce Alıcı'ya açıkça gösterilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Ödeme Yöntemi</h2>
              <p>
                Ödemeler; kredi kartı ve banka kartıyla Iyzico 3D Secure güvencesi altında gerçekleştirilmektedir.
                Kart bilgileri Satıcı tarafından saklanmaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. Teslimat Koşulları</h2>
              <div className="space-y-3">
                {[
                  ["Teslimat Süresi", "Ödeme onayından itibaren en geç 30 iş günü; olağan durumlarda 3–7 iş günü"],
                  ["Teslimat Adresi", "Sipariş formunda Alıcı'nın bildirdiği adres"],
                  ["Kargo Ücreti", "Tüm siparişlerde ücretsiz kargo"],
                ].map(([label, val]) => (
                  <div key={label} className="flex flex-col md:flex-row md:gap-4 border-b border-black/6 pb-3 last:border-0 last:pb-0">
                    <span className="font-medium text-black md:w-44 shrink-0">{label}</span>
                    <span className="text-gray-600">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">6. Cayma Hakkı</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-900 text-sm mb-4">
                <strong>Önemli:</strong> Alıcı, malı teslim aldığı tarihten itibaren{" "}
                <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin
                sözleşmeden cayma hakkına sahiptir.
              </div>
              <p>
                Cayma bildirimi{" "}
                <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
                  info@bedirkahvecistyling.com
                </a>{" "}
                adresine iletilir. Alıcı ürünü 10 gün içinde iade eder; Satıcı bedeli 14 gün içinde iade eder.
                İade kargo bedeli Alıcı'ya aittir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">7. Garanti</h2>
              <p>
                Tüm ürünler 6502 sayılı TKHK kapsamında <strong className="text-black">2 (iki) yıl</strong> yasal
                garantiye tabidir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">8. Şikayet ve Uyuşmazlık</h2>
              <p>
                Şikayetleriniz için{" "}
                <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
                  info@bedirkahvecistyling.com
                </a>{" "}
                adresine başvurabilirsiniz. Çözüme kavuşturulamayan uyuşmazlıklarda{" "}
                <strong className="text-black">Tüketici Hakem Heyeti</strong> veya{" "}
                <strong className="text-black">Tüketici Mahkemeleri</strong>'ne başvurabilirsiniz.
              </p>
            </div>

            <div className="bg-black text-white rounded-2xl px-5 py-5 text-sm leading-7">
              <p className="font-semibold text-base mb-2">Alıcı Onayı</p>
              <p>
                Alıcı, ödeme adımında "Siparişi Tamamla" butonuna tıklamadan önce bu formu okuduğunu
                ve içeriğini anladığını kabul etmiş sayılır.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}