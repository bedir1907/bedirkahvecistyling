import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

const SSS = [
  {
    kategori: "Sipariş",
    sorular: [
      { soru: "Siparişimi nasıl takip edebilirim?", cevap: "Siparişiniz kargoya verildiğinde e-posta ve SMS ile kargo takip numarası iletilir. Hesabınıza giriş yaparak Siparişlerim sayfasından da güncel durumu görebilirsiniz." },
      { soru: "Siparişimi iptal edebilir miyim?", cevap: "Siparişiniz henüz kargoya verilmemişse iptal talebi için info@bedirkahvecistyling.com adresine ulaşabilirsiniz." },
      { soru: "Sipariş adresimi değiştirebilir miyim?", cevap: "Sipariş kargoya verilmeden önce adres değişikliği yapılabilir. Bunun için en kısa sürede info@bedirkahvecistyling.com adresine yazmanız gerekir." },
    ],
  },
  {
    kategori: "Ödeme",
    sorular: [
      { soru: "Hangi ödeme yöntemlerini kabul ediyorsunuz?", cevap: "Kredi kartı ve banka kartıyla 3D Secure güvencesiyle ödeme yapabilirsiniz. Tüm ödeme işlemleri Iyzico altyapısı üzerinden güvenle gerçekleştirilir." },
      { soru: "Kart bilgilerim saklanıyor mu?", cevap: "Hayır. Kart bilgileriniz hiçbir şekilde sunucularımızda saklanmaz. Tüm ödeme işlemleri Iyzico'nun güvenli ortamında işlenir." },
      { soru: "Ödeme sırasında hata alıyorum.", cevap: "Önce kartınızın internet alışverişine açık olduğundan emin olun. Sorun devam ederse info@bedirkahvecistyling.com adresine ulaşabilirsiniz." },
    ],
  },
  {
    kategori: "Ürün ve Beden",
    sorular: [
      { soru: "Beden tablosunu nasıl kullanabilirim?", cevap: "Her ürün sayfasında beden rehberi yer almaktadır. Tereddüt ettiğinizde bir üst beden almanız önerilir." },
      { soru: "Aradığım ürün stokta yok.", cevap: "Stok bilgisi için info@bedirkahvecistyling.com adresine ürün adı ve bedenini yazabilirsiniz. Ürün tekrar stoka girdiğinde size bildirim yapılır." },
    ],
  },
  {
    kategori: "İade ve Değişim",
    sorular: [
      { soru: "Kaç gün içinde iade yapabilirim?", cevap: "Teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz." },
      { soru: "İade kargosunu ben mi ödüyorum?", cevap: "Standart iadelerde kargo bedeli alıcıya aittir." },
      { soru: "Param ne zaman iade edilir?", cevap: "İade ürün bize ulaştıktan ve uygunluk kontrolü tamamlandıktan sonra en geç 14 gün içinde ödeme yönteminize iade yapılır." },
    ],
  },
  {
    kategori: "Hesap",
    sorular: [
      { soru: "Şifremi unuttum.", cevap: "Giriş sayfasındaki 'Şifremi Unuttum' bağlantısına tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz." },
      { soru: "Kişisel verilerim güvende mi?", cevap: "Verileriniz KVKK kapsamında korunmaktadır. Ödeme bilgileriniz PCI-DSS sertifikalı Iyzico altyapısında işlenir." },
    ],
  },
]

export const metadata = {
  title: "Sık Sorulan Sorular",
  description: "Bedir Kahveci Styling sık sorulan sorular.",
}

export default function SikcaSorulanSorularPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Sık Sorulan Sorular</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Yardım Merkezi</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Sık Sorulan Sorular</h1>
          <p className="text-sm text-gray-500 mt-3">
            Aradığınız cevabı bulamazsanız{" "}
            <Link href="/iletisim" className="underline hover:text-black transition">bize yazın</Link>,
            en geç 1 iş günü içinde yanıt veririz.
          </p>

          <div className="mt-10 space-y-10">
            {SSS.map((kategori) => (
              <div key={kategori.kategori}>
                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-black rounded-full inline-block" />
                  {kategori.kategori}
                </h2>
                <div className="space-y-3">
                  {kategori.sorular.map((item, i) => (
                    <details key={i} className="group bg-white border border-black/8 rounded-2xl overflow-hidden">
                      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-medium text-black hover:bg-gray-50 transition select-none">
                        <span>{item.soru}</span>
                        <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200">▾</span>
                      </summary>
                      <div className="px-5 pb-5 pt-1 text-gray-600 text-sm leading-7 border-t border-black/6">
                        {item.cevap}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-black text-white rounded-2xl px-6 py-6 text-center">
            <p className="font-semibold text-lg">Hâlâ sorunuz mu var?</p>
            <p className="text-white/70 text-sm mt-1 mb-4">Size yardımcı olmaktan memnuniyet duyarız.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/iletisim" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition">
                Bize Ulaşın
              </Link>
              <a href="tel:+905531361261" className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition">
                +90 553 136 12 61
              </a>
            </div>
          </div>

        </div>
      </section>
      <StoreFooter />
    </main>
  )
}