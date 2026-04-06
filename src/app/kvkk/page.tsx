import Link from "next/link"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreFooter from "@/components/store/StoreFooter"

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span className="text-black">KVKK Aydınlatma Metni</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            KVKK Aydınlatma Metni
          </h1>

          <div className="mt-10 space-y-5 text-gray-700 leading-7">
            <p>
              İşbu Aydınlatma Metni, veri sorumlusu sıfatıyla hareket eden
              [ŞİRKET / MAĞAZA ADI] tarafından, 6698 sayılı Kişisel Verilerin
              Korunması Kanunu kapsamında, kişisel verilerin işlenmesine ilişkin
              olarak sizleri bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <h2 className="text-xl font-medium text-black">1. İşlenen Veriler</h2>
            <p>
              Ad soyad, telefon numarası, e-posta adresi, teslimat ve fatura
              adresi, sipariş bilgileri, ödeme sürecine ilişkin işlem kayıtları,
              müşteri destek talep bilgileri işlenebilir.
            </p>

            <h2 className="text-xl font-medium text-black">2. İşleme Amaçları</h2>
            <p>
              Kişisel verileriniz; siparişlerin alınması ve teslim edilmesi,
              ödeme süreçlerinin yürütülmesi, iade ve değişim işlemlerinin
              yerine getirilmesi, müşteri hizmetlerinin sunulması, yasal
              yükümlülüklerin yerine getirilmesi ve gerektiğinde uyuşmazlıkların
              çözülmesi amacıyla işlenebilir.
            </p>

            <h2 className="text-xl font-medium text-black">3. Hukuki Sebep</h2>
            <p>
              Kişisel verileriniz; sözleşmenin kurulması ve ifası, hukuki
              yükümlülüklerin yerine getirilmesi, bir hakkın tesisi, kullanılması
              veya korunması ve meşru menfaat hukuki sebeplerine dayanılarak
              işlenebilir.
            </p>

            <h2 className="text-xl font-medium text-black">4. Aktarım</h2>
            <p>
              Kişisel verileriniz; ödeme kuruluşları, kargo firmaları, bilişim
              altyapı sağlayıcıları, mali müşavirlik süreçleri ve yasal olarak
              yetkili kamu kurum ve kuruluşlarıyla, amaçla sınırlı olmak üzere
              paylaşılabilir.
            </p>

            <h2 className="text-xl font-medium text-black">5. Haklarınız</h2>
            <p>
              KVKK’nın 11. maddesi kapsamında; kişisel verilerinizin işlenip
              işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
              işleme amacını öğrenme, düzeltme, silme veya yok edilmesini isteme
              ve kanunda öngörülen diğer haklara sahipsiniz.
            </p>

            <h2 className="text-xl font-medium text-black">6. Başvuru</h2>
            <p>
              KVKK kapsamındaki taleplerinizi [E-POSTA] adresi veya [ADRES]
              üzerinden tarafımıza iletebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}