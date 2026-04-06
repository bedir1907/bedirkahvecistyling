import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">Sık Sorulan Sorular</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Sık Sorulan Sorular
          </h1>

          <div className="mt-10 space-y-8 text-gray-700 leading-7">
            <div>
              <h2 className="text-xl font-medium text-black">
                Siparişim ne zaman kargoya verilir?
              </h2>
              <p className="mt-2">
                Siparişler genellikle 1-3 iş günü içinde hazırlanarak kargoya
                teslim edilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-black">
                Kargo takibini nasıl yapabilirim?
              </h2>
              <p className="mt-2">
                Siparişiniz kargoya verildiğinde, takip süreciyle ilgili
                bilgilendirme tarafınıza iletilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-black">
                İade süresi ne kadar?
              </h2>
              <p className="mt-2">
                İade süreci, ilgili mevzuat ve ürün koşullarına uygun olarak
                değerlendirilir. Detaylar için İade ve Değişim sayfasını
                inceleyebilirsin.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-black">
                Ürün değişimi yapabiliyor muyum?
              </h2>
              <p className="mt-2">
                Uygun stok bulunması halinde değişim talebiniz destek ekibimiz
                tarafından değerlendirilebilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-medium text-black">
                Siparişimi iptal edebilir miyim?
              </h2>
              <p className="mt-2">
                Siparişiniz henüz işleme alınmadıysa veya kargoya verilmediyse
                iptal talebiniz değerlendirilebilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}