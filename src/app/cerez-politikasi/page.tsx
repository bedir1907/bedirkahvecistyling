import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "Çerez Politikası",
  description: "Bedir Kahveci Styling çerez politikası.",
}

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Çerez Politikası</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Yasal Belge</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Çerez Politikası</h1>
          <p className="text-sm text-gray-500 mt-3">Son güncelleme: Mayıs 2025</p>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            <p>
              Bu Çerez Politikası; <strong className="text-black">Bedir Kahveci Styling</strong>{" "}
              tarafından işletilen <strong className="text-black">www.bedirkahvecistyling.com</strong> adresli
              internet sitesinde kullanılan çerezler hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">1. Çerez Nedir?</h2>
              <p>
                Çerezler; bir internet sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen
                küçük metin dosyalarıdır. Oturum bilgilerini hatırlamak, tercihlerinizi saklamak ve site trafiğini
                analiz etmek amacıyla kullanılır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. Kullandığımız Çerez Türleri</h2>
              <div className="space-y-4">
                {[
                  {
                    tur: "Zorunlu Çerezler",
                    renk: "bg-gray-900 text-white",
                    aciklama: "Sitenin temel işlevlerinin çalışması için zorunludur. Oturum yönetimi, sepet bilgisi, güvenlik doğrulaması bu kapsamdadır. Devre dışı bırakılamaz.",
                    sure: "Oturum süresi",
                  },
                  {
                    tur: "İşlevsellik Çerezleri",
                    renk: "bg-gray-700 text-white",
                    aciklama: "Tercihlerinizi (çerez onayı gibi) hatırlayarak daha iyi bir deneyim sunar.",
                    sure: "12 aya kadar",
                  },
                  {
                    tur: "Analitik Çerezler",
                    renk: "bg-gray-500 text-white",
                    aciklama: "Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Veriler anonim olarak işlenir.",
                    sure: "2 yıla kadar",
                  },
                ].map((item) => (
                  <div key={item.tur} className="border border-black/8 rounded-2xl overflow-hidden">
                    <div className={`px-5 py-3 ${item.renk}`}>
                      <p className="font-semibold">{item.tur}</p>
                    </div>
                    <div className="px-5 py-4 bg-white space-y-1">
                      <p className="text-sm">{item.aciklama}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Saklama süresi: </span>{item.sure}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Çerez Tercihlerinizi Yönetme</h2>
              <p className="mb-3">Zorunlu çerezler dışındaki tüm çerez türleri için sitemizi ilk ziyaret ettiğinizde onayınız alınır.</p>
              <ul className="space-y-2">
                {[
                  "Sayfanın altındaki çerez banner'ından tercihlerinizi güncelleyebilirsiniz.",
                  "Chrome, Firefox, Safari gibi tarayıcıların ayarlarından çerezleri yönetebilirsiniz.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. İletişim</h2>
              <p>
                Çerez politikasına ilişkin sorularınız için:{" "}
                <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
                  info@bedirkahvecistyling.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. KVKK Kapsamında Haklarınız</h2>
              <p>
                Çerezler aracılığıyla işlenen kişisel verilerinize ilişkin haklarınız için{" "}
                <Link href="/kvkk" className="underline hover:text-black transition">KVKK Aydınlatma Metni</Link>'ni
                inceleyebilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}