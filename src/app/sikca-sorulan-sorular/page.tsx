import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "Sık Sorulan Sorular",
  description: "Bedir Kahveci Styling sık sorulan sorular.",
}

const SSS = [
  {
    kategori: "Sipariş",
    sorular: [
      {
        soru: "Siparişimi nasıl takip edebilirim?",
        cevap:
          "Siparişiniz kargoya verildiğinde e-posta ve SMS ile kargo takip numarası iletilir. Hesabınıza giriş yaparak Siparişlerim sayfasından da güncel durumu görebilirsiniz.",
      },
      {
        soru: "Siparişimi iptal edebilir miyim?",
        cevap:
          "Siparişiniz henüz kargoya verilmemişse iptal talebi için info@bedirkahveci.com adresine ulaşabilirsiniz. Kargoya verilen siparişler için iade süreci başlatılır.",
      },
      {
        soru: "Sipariş adresimi değiştirebilir miyim?",
        cevap:
          "Sipariş kargoya verilmeden önce adres değişikliği yapılabilir. Bunun için en kısa sürede info@bedirkahveci.com adresine sipariş numaranızla yazmanız gerekir.",
      },
      {
        soru: "Aynı sipariş içinde birden fazla ürün alabilirim?",
        cevap:
          "Evet, sepetinize istediğiniz sayıda ürün ekleyebilirsiniz. Stokta olan ürünler tek kargoda gönderilir. Stok durumuna göre kısmi gönderim yapılabilir.",
      },
    ],
  },
  {
    kategori: "Ödeme",
    sorular: [
      {
        soru: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        cevap:
          "Kredi kartı ve banka kartıyla 3D Secure güvencesiyle ödeme yapabilirsiniz. Tüm ödeme işlemleri Iyzico altyapısı üzerinden PCI-DSS standartlarında güvenli biçimde gerçekleştirilir.",
      },
      {
        soru: "Taksit seçeneği var mı?",
        cevap:
          "Bankanızın sunduğu taksit imkânlarından yararlanabilirsiniz. Taksit seçenekleri ödeme sayfasında kartınıza göre otomatik olarak listelenir.",
      },
      {
        soru: "Kart bilgilerim saklanıyor mu?",
        cevap:
          "Hayır. Kart bilgileriniz hiçbir şekilde sunucularımızda saklanmaz. Tüm ödeme işlemleri Iyzico'nun güvenli ortamında işlenir.",
      },
      {
        soru: "Ödeme sırasında hata alıyorum, ne yapmalıyım?",
        cevap:
          "Önce kartınızın internet alışverişine açık olduğundan emin olun. Sorun devam ederse farklı bir tarayıcı deneyin veya bankanızı arayın. Yardım için info@bedirkahveci.com adresine ulaşabilirsiniz.",
      },
    ],
  },
  {
    kategori: "Ürün ve Beden",
    sorular: [
      {
        soru: "Beden tablosunu nasıl kullanabilirim?",
        cevap:
          "Her ürün sayfasında beden rehberi yer almaktadır. Göğüs, bel ve kalça ölçülerinizi alarak tabloda size en uygun bedeni bulabilirsiniz. Tereddüt ettiğinizde bir üst beden almanız önerilir.",
      },
      {
        soru: "Ürün rengi fotoğraftaki gibi mi?",
        cevap:
          "Ürün görselleri gerçekçi renk aktarımı için stüdyo koşullarında çekilmiştir; ancak monitör ve ekran ayarlarına bağlı olarak hafif renk farkı oluşabilir. Bu durum iade gerekçesi teşkil etmez.",
      },
      {
        soru: "Aradığım ürün stokta yok, ne zaman gelecek?",
        cevap:
          "Stok bilgisi için info@bedirkahveci.com adresine ürün adı ve bedenini yazabilirsiniz. Ürün tekrar stoka girdiğinde size bildirim yapılır.",
      },
      {
        soru: "Ürün bakım talimatları nerede?",
        cevap:
          "Her ürünün yıkama ve bakım talimatları ürün etiketinde yer almaktadır. Genel olarak ilk yıkamayı ters çevirerek, soğuk suda ve hassas programda yapmanızı öneririz.",
      },
    ],
  },
  {
    kategori: "İade ve Değişim",
    sorular: [
      {
        soru: "Kaç gün içinde iade yapabilirim?",
        cevap:
          "Teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz. Detaylı bilgi için İade ve Değişim sayfamızı inceleyebilirsiniz.",
      },
      {
        soru: "İade kargosunu ben mi ödüyorum?",
        cevap:
          "Standart iadelerde kargo bedeli alıcıya aittir. Ücretsiz iade kampanyaları döneminde bu kural geçerli değildir; sipariş e-postanızda belirtilir.",
      },
      {
        soru: "Değişim yapabilir miyim?",
        cevap:
          "Evet, beden veya renk değişimi için 14 gün içinde iade@bedirkahveci.com adresine yazabilirsiniz. Stok varsa ücretsiz değişim yapılır, yeni ürünün kargosu tarafımızca karşılanır.",
      },
      {
        soru: "Param ne zaman iade edilir?",
        cevap:
          "İade ürün bize ulaştıktan ve uygunluk kontrolü tamamlandıktan sonra en geç 14 gün içinde ödeme yönteminize iade yapılır. Kredi kartı iadeleri bankaya göre 3–10 iş günü içinde hesabınıza geçer.",
      },
    ],
  },
  {
    kategori: "Hesap ve Güvenlik",
    sorular: [
      {
        soru: "Üye olmadan sipariş verebilir miyim?",
        cevap:
          "Hayır, sipariş vermek için üye olmanız gerekmektedir. Üyelik tamamen ücretsizdir ve sipariş takibi, adres kaydetme gibi kolaylıklar sağlar.",
      },
      {
        soru: "Şifremi unuttum, ne yapabilirim?",
        cevap:
          "Giriş sayfasındaki 'Şifremi Unuttum' bağlantısına tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz.",
      },
      {
        soru: "Kişisel verilerim güvende mi?",
        cevap:
          "Verileriniz KVKK kapsamında korunmaktadır. Ödeme bilgileriniz PCI-DSS sertifikalı Iyzico altyapısında işlenir; kart bilgileriniz sunucularımızda tutulmaz. Detaylı bilgi için KVKK Aydınlatma Metni sayfamızı inceleyebilirsiniz.",
      },
    ],
  },
]

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
                    <details
                      key={i}
                      className="group bg-white border border-black/8 rounded-2xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-medium text-black hover:bg-gray-50 transition select-none">
                        <span>{item.soru}</span>
                        <span className="shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                          ▾
                        </span>
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

          {/* Hâlâ sorunuz var mı? */}
          <div className="mt-12 bg-black text-white rounded-2xl px-6 py-6 text-center">
            <p className="font-semibold text-lg">Hâlâ sorunuz mu var?</p>
            <p className="text-white/70 text-sm mt-1 mb-4">
              Size yardımcı olmaktan memnuniyet duyarız.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              Bize Ulaşın
            </Link>
          </div>

        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
