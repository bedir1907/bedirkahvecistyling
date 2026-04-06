import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">Çerez Politikası</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Çerez Politikası
          </h1>

          <div className="mt-10 space-y-5 text-gray-700 leading-7">
            <p>
              Bu Çerez Politikası, [ŞİRKET / MAĞAZA ADI] tarafından işletilen
              internet sitesi üzerinde kullanılan çerezler hakkında bilgi vermek
              amacıyla hazırlanmıştır.
            </p>

            <h2 className="text-xl font-medium text-black">1. Çerez Nedir?</h2>
            <p>
              Çerezler, internet sitesini ziyaret ettiğinizde cihazınıza
              kaydedilebilen küçük metin dosyalarıdır.
            </p>

            <h2 className="text-xl font-medium text-black">2. Kullanım Amaçları</h2>
            <p>
              Çerezler; site performansının artırılması, kullanıcı deneyiminin
              geliştirilmesi, oturum yönetimi, tercihlerin hatırlanması ve
              analiz yapılması amacıyla kullanılabilir.
            </p>

            <h2 className="text-xl font-medium text-black">3. Çerez Türleri</h2>
            <p>
              Zorunlu çerezler, performans ve analiz çerezleri ile işlevsellik
              çerezleri kullanılabilir. Zorunlu olmayan çerezler bakımından
              gerekli hallerde tercihlerinize başvurulur.
            </p>

            <h2 className="text-xl font-medium text-black">4. Çerez Tercihleri</h2>
            <p>
              Tarayıcı ayarlarınız üzerinden çerez tercihlerinizi değiştirebilir,
              bazı çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durum
              sitenin bazı işlevlerini etkileyebilir.
            </p>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}