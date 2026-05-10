import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

export default function DistanceSalesPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">Mesafeli Satış Sözleşmesi</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Mesafeli Satış Sözleşmesi
          </h1>

          <div className="mt-10 space-y-5 text-gray-700 leading-7">
            <p>
              İşbu sözleşme, alıcı ile satıcı arasında internet sitesi üzerinden
              kurulan mesafeli satış ilişkisine ilişkin hak ve yükümlülükleri
              düzenler.
            </p>

            <h2 className="text-xl font-medium text-black">1. Taraflar</h2>
            <p>
              Satıcı: [ŞİRKET / MAĞAZA ADI]
              <br />
              Adres: [ADRES]
              <br />
              E-posta: [E-POSTA]
              <br />
              Telefon: [TELEFON]
            </p>

            <h2 className="text-xl font-medium text-black">2. Konu</h2>
            <p>
              Bu sözleşmenin konusu, alıcının satıcıya ait internet sitesi
              üzerinden elektronik ortamda sipariş verdiği ürünün satışı ve
              teslimine ilişkin tarafların hak ve yükümlülüklerinin
              belirlenmesidir.
            </p>

            <h2 className="text-xl font-medium text-black">3. Sipariş ve Ödeme</h2>
            <p>
              Siparişe ilişkin ürün bilgileri, fiyat, ödeme şekli ve teslimat
              detayları sipariş özeti ekranında gösterilir ve alıcı tarafından
              onaylanır.
            </p>

            <h2 className="text-xl font-medium text-black">4. Teslimat</h2>
            <p>
              Ürün, sipariş onayı sonrasında makul süre içinde ve belirtilen
              teslimat adresine gönderilir.
            </p>

            <h2 className="text-xl font-medium text-black">5. Cayma Hakkı</h2>
            <p>
              Alıcı, ilgili mevzuat kapsamında cayma hakkına sahip olabilir.
              Cayma hakkının kullanım şartları ve istisnaları ilgili mevzuat ile
              İade ve Değişim sayfasında belirtilen esaslara tabidir.
            </p>

            <h2 className="text-xl font-medium text-black">6. Yürürlük</h2>
            <p>
              Alıcı, siparişi tamamlayarak işbu sözleşme hükümlerini kabul etmiş
              sayılır.
            </p>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}