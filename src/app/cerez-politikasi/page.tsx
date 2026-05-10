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
              tarafından işletilen <strong className="text-black">www.bedirkahveci.com</strong> adresli
              internet sitesinde kullanılan çerezler hakkında sizi bilgilendirmek amacıyla 6698 sayılı
              KVKK ve ilgili mevzuat kapsamında hazırlanmıştır.
            </p>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">1. Çerez Nedir?</h2>
              <p>
                Çerezler (cookies); bir internet sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla
                cihazınıza (bilgisayar, tablet, akıllı telefon) kaydedilen küçük metin dosyalarıdır.
                Çerezler; oturum bilgilerini hatırlamak, tercihlerinizi saklamak, site trafiğini analiz
                etmek ve size daha iyi bir deneyim sunmak amacıyla yaygın biçimde kullanılmaktadır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. Kullandığımız Çerez Türleri</h2>
              <div className="space-y-4">
                {[
                  {
                    tur: "Zorunlu (Teknik) Çerezler",
                    renk: "bg-gray-900 text-white",
                    aciklama: "Sitenin temel işlevlerinin çalışması için zorunludur. Oturum yönetimi, sepet bilgisi, güvenlik doğrulaması bu kapsamdadır. Bu çerezler devre dışı bırakılamaz; aksi halde site düzgün çalışmaz.",
                    ornekler: ["Oturum çerezi (auth token)", "Sepet verileri (localStorage)", "CSRF koruma çerezi"],
                    sure: "Oturum süresi veya tarayıcı kapanana kadar",
                  },
                  {
                    tur: "İşlevsellik Çerezleri",
                    renk: "bg-gray-700 text-white",
                    aciklama: "Tercihlerinizi (dil, tema, son görüntülenen ürünler gibi) hatırlayarak daha kişisel bir deneyim sunar.",
                    ornekler: ["Çerez onay tercihi (cookie_consent)", "Son ziyaret edilen sayfalar"],
                    sure: "12 aya kadar",
                  },
                  {
                    tur: "Analitik Çerezler",
                    renk: "bg-gray-500 text-white",
                    aciklama: "Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Bu veriler anonim veya takma ad kullanılarak işlenir; hiçbir şekilde kişisel tanımlama yapılmaz.",
                    ornekler: ["Sayfa görüntüleme sayısı", "Sitede geçirilen süre", "Giriş/çıkış sayfaları"],
                    sure: "2 yıla kadar",
                  },
                  {
                    tur: "Pazarlama / Hedefleme Çerezleri",
                    renk: "bg-gray-400 text-white",
                    aciklama: "Yalnızca açık onayınız alınmışsa kullanılır. İlgi alanlarınıza göre reklamlar göstermek ve kampanya etkinliğini ölçmek amacıyla kullanılabilir.",
                    ornekler: ["Yeniden hedefleme", "Sosyal medya entegrasyonu"],
                    sure: "Onay geri çekilene kadar",
                  },
                ].map((item) => (
                  <div key={item.tur} className="border border-black/8 rounded-2xl overflow-hidden">
                    <div className={`px-5 py-3 ${item.renk}`}>
                      <p className="font-semibold">{item.tur}</p>
                    </div>
                    <div className="px-5 py-4 bg-white space-y-2">
                      <p className="text-sm">{item.aciklama}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Örnekler: </span>
                        {item.ornekler.join(", ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Saklama süresi: </span>
                        {item.sure}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Üçüncü Taraf Çerezleri</h2>
              <p className="mb-3">
                Sitemizde aşağıdaki üçüncü taraf hizmetleri çerez veya benzeri izleme teknolojileri kullanabilir:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-4 py-2.5 text-left rounded-tl-xl font-medium">Hizmet</th>
                      <th className="px-4 py-2.5 text-left font-medium">Amaç</th>
                      <th className="px-4 py-2.5 text-left rounded-tr-xl font-medium">Politika</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8">
                    {[
                      ["Iyzico", "Güvenli ödeme işlemi", "iyzico.com/gizlilik"],
                      ["Cloudinary", "Görsel yükleme ve sunumu", "cloudinary.com/privacy"],
                      ["Google Analytics (opsiyonel)", "Site trafiği analizi", "policies.google.com/privacy"],
                    ].map(([hizmet, amac, link]) => (
                      <tr key={hizmet} className="even:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-black">{hizmet}</td>
                        <td className="px-4 py-3 text-gray-600">{amac}</td>
                        <td className="px-4 py-3">
                          <a href={`https://${link}`} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-black transition">{link}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Çerez Tercihlerinizi Yönetme</h2>
              <p className="mb-3">
                Zorunlu çerezler dışındaki tüm çerez türleri için sitemizi ilk ziyaret ettiğinizde
                onayınız alınır. Tercihlerinizi dilediğiniz zaman değiştirebilirsiniz:
              </p>
              <ul className="space-y-3">
                {[
                  ["Site üzerinden", "Sayfanın altında yer alan çerez banner'ından tercihlerinizi güncelleyebilirsiniz."],
                  ["Tarayıcı ayarları", "Chrome, Firefox, Safari, Edge gibi tarayıcıların ayarlar menüsünden çerezleri yönetebilir, silebilir veya engelleyebilirsiniz."],
                  ["Opt-out araçları", "Google Analytics için: tools.google.com/dlpage/gaoptout adresini kullanabilirsiniz."],
                ].map(([yontem, aciklama]) => (
                  <li key={yontem} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span><span className="font-medium text-black">{yontem}: </span>{aciklama}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
                Zorunlu çerezleri devre dışı bırakırsanız oturum açma, sepet ve ödeme gibi
                temel işlevler çalışmayabilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. KVKK Kapsamında Haklarınız</h2>
              <p>
                Çerezler aracılığıyla işlenen kişisel verilerinize ilişkin haklarınız ve başvuru
                yöntemi için{" "}
                <Link href="/kvkk" className="underline hover:text-black transition">
                  KVKK Aydınlatma Metni
                </Link>
                'ni inceleyebilirsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">6. İletişim</h2>
              <p>
                Çerez politikasına ilişkin sorularınız için:{" "}
                <a href="mailto:kvkk@bedirkahveci.com" className="underline hover:text-black transition">
                  kvkk@bedirkahveci.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">7. Politika Güncellemeleri</h2>
              <p>
                Bu politika, yasal değişiklikler veya kullandığımız teknolojilerdeki güncellemeler
                doğrultusunda revize edilebilir. Önemli değişikliklerde kullanıcılar bilgilendirilir;
                güncel metin her zaman bu sayfada yayımlanır.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
