import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

export default function PreInfoPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">Mesafeli Satış Ön Bilgilendirme Formu</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Mesafeli Satış Ön Bilgilendirme Formu
          </h1>

          <div className="mt-10 space-y-5 text-gray-700 leading-7">
            <p>
              İşbu ön bilgilendirme formu, mesafeli satış sözleşmesi kurulmadan
              önce tüketicinin bilgilendirilmesi amacıyla hazırlanmıştır.
            </p>

            <h2 className="text-xl font-medium text-black">Satıcı Bilgileri</h2>
            <p>
              Unvan: [ŞİRKET / MAĞAZA ADI]
              <br />
              Adres: [ADRES]
              <br />
              E-posta: [E-POSTA]
              <br />
              Telefon: [TELEFON]
              <br />
              Vergi Bilgisi: [VERGİ DAİRESİ / VERGİ NO]
            </p>

            <h2 className="text-xl font-medium text-black">Ürün / Hizmet Bilgisi</h2>
            <p>
              Satın alınan ürünlerin temel nitelikleri, satış fiyatı, ödeme
              şekli ve teslimat bilgileri sipariş özeti ekranında ayrıca
              gösterilmektedir.
            </p>

            <h2 className="text-xl font-medium text-black">Teslimat</h2>
            <p>
              Siparişler, stok ve operasyonel yoğunluğa bağlı olarak makul süre
              içinde hazırlanarak kargo firmasına teslim edilir.
            </p>

            <h2 className="text-xl font-medium text-black">Cayma Hakkı</h2>
            <p>
              Tüketici, ilgili mevzuatta öngörülen şartlar dahilinde cayma
              hakkına sahiptir. Cayma hakkının kullanımı ve istisnaları İade ve
              Değişim sayfasında ayrıca açıklanır.
            </p>

            <h2 className="text-xl font-medium text-black">Uyuşmazlık</h2>
            <p>
              Uyuşmazlıklarda, mevzuatta belirlenen parasal sınırlara göre
              tüketici hakem heyetleri ve tüketici mahkemeleri yetkilidir.
            </p>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}