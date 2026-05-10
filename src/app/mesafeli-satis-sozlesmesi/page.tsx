import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "Bedir Kahveci Styling mesafeli satış sözleşmesi.",
}

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Mesafeli Satış Sözleşmesi</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Yasal Belge</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-sm text-gray-500 mt-3">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır.
            Son güncelleme: Mayıs 2025
          </p>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            {/* Madde 1 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Madde 1 — Taraflar</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 space-y-1 text-sm">
                  <p className="font-semibold text-black text-base mb-2">SATICI</p>
                  <p><span className="text-gray-500 w-24 inline-block">Unvan</span> Bedir Kahveci Styling</p>
                  <p><span className="text-gray-500 w-24 inline-block">Adres</span> [Şirket adresi]</p>
                  <p><span className="text-gray-500 w-24 inline-block">E-posta</span> info@bedirkahveci.com</p>
                  <p><span className="text-gray-500 w-24 inline-block">Telefon</span> [Telefon numarası]</p>
                  <p><span className="text-gray-500 w-24 inline-block">Web Sitesi</span> www.bedirkahveci.com</p>
                </div>
                <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 space-y-1 text-sm">
                  <p className="font-semibold text-black text-base mb-2">ALICI</p>
                  <p className="text-gray-600">
                    Sipariş formunda belirtilen; ad, soyad, teslimat adresi, e-posta adresi
                    ve telefon numarasına sahip tüketicidir.
                  </p>
                </div>
              </div>
            </div>

            {/* Madde 2 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 2 — Sözleşmenin Konusu ve Kapsamı</h2>
              <p>
                İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"); Alıcı'nın, Satıcı'ya ait{" "}
                <strong className="text-black">www.bedirkahveci.com</strong> adresindeki internet sitesi
                üzerinden elektronik ortamda sipariş verdiği giyim ürünleri ile ilgili mal satışı ve
                teslimatına ilişkin tarafların hak ve yükümlülüklerini, 6502 sayılı Tüketicinin Korunması
                Hakkında Kanun ("TKHK") ve Mesafeli Sözleşmeler Yönetmeliği ("Yönetmelik") hükümleri
                çerçevesinde düzenlemektedir.
              </p>
            </div>

            {/* Madde 3 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 3 — Ürün Bilgileri</h2>
              <p>
                Sözleşme konusu ürünlerin temel özellikleri (beden, renk, materyal, bakım talimatları),
                satış fiyatı (KDV dahil), ödeme ve teslimat bilgileri sipariş özeti sayfasında gösterilir
                ve Alıcı tarafından onaylanır. Alıcı, sipariş vermeden önce bu bilgileri incelemiş ve
                kabul etmiş sayılır.
              </p>
              <p className="mt-3">
                Ürün görselleri tanıtım amaçlı olup renk farklılıkları monitör ayarlarından
                kaynaklanabilir; bu durum iade gerekçesi teşkil etmez. Ürünlerde belirtilen bedenler
                standart Türk beden tablosuna göre düzenlenmiştir.
              </p>
            </div>

            {/* Madde 4 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 4 — Fiyat ve Ödeme</h2>
              <p>
                Ürün fiyatları Türk Lirası (TL) cinsinden ve KDV dahil olarak belirtilmektedir.
                Satıcı, fiyatları önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar;
                ancak onaylanmış bir siparişin fiyatı değiştirilemez.
              </p>
              <p className="mt-3">
                Ödemeler, Iyzico Ödeme Hizmetleri A.Ş. altyapısı üzerinden 3D Secure güvencesiyle
                gerçekleştirilmektedir. Kredi kartı, banka kartı ve desteklenen diğer ödeme yöntemleri
                kullanılabilir. Kart bilgileri Satıcı sunucularında saklanmaz; tüm işlemler Iyzico'nun
                PCI-DSS sertifikalı güvenli ortamında yürütülür.
              </p>
              <p className="mt-3">
                Ödemenin gerçekleşmemesi veya iptal edilmesi halinde sipariş işleme alınmaz ve
                Alıcı bilgilendirilir.
              </p>
            </div>

            {/* Madde 5 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 5 — Teslimat</h2>
              <p>
                Siparişler, ödemenin onaylanmasının ardından hazırlanmaya başlanır ve kargo firmasına
                teslim edilir. Teslimat süresi, ödeme onayı tarihinden itibaren en fazla{" "}
                <strong className="text-black">30 (otuz) iş günü</strong> olup olağan durumlarda
                3–7 iş günü içinde gerçekleşmesi hedeflenmektedir.
              </p>
              <p className="mt-3">
                Teslimat; Alıcı'nın sipariş sırasında belirttiği adrese yapılır. Belirtilen adresin
                hatalı veya eksik olmasından kaynaklanan gecikmelerden Satıcı sorumlu tutulamaz.
                Teslimat anında Alıcı veya yetkili temsilcisi adreste bulunmazsa ve kargocunun bıraktığı
                bildirime rağmen teslim alınmazsa, ürün kargo merkezinde belirli süre bekletilir;
                bu süre içinde teslim alınmazsa iade süreci başlatılır.
              </p>
              <p className="mt-3">
                Teslimat sırasında ürün hasarı tespit edilirse, teslimat görevlisine tutanak tutturularak
                ürün teslim alınmayabilir. Tutanaksız teslim alınan hasarlı ürünler için kargo
                kaynaklı hasar talebi işletilemez.
              </p>
            </div>

            {/* Madde 6 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 6 — Cayma Hakkı</h2>
              <p>
                Alıcı, herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin, malı teslim
                aldığı tarihten itibaren <strong className="text-black">14 (on dört) gün</strong> içinde
                sözleşmeden cayma hakkına sahiptir.
              </p>
              <p className="mt-3">
                Cayma hakkını kullanmak için bu süre içinde{" "}
                <a href="mailto:iade@bedirkahveci.com" className="underline hover:text-black transition">
                  iade@bedirkahveci.com
                </a>{" "}
                adresine veya{" "}
                <Link href="/iletisim" className="underline hover:text-black transition">İletişim</Link>{" "}
                formuna cayma bildirimi iletilmesi yeterlidir. Cayma bildiriminin süresinde yapıldığına
                dair ispat yükümlülüğü Alıcı'ya aittir.
              </p>
              <p className="mt-3">
                Cayma hakkının kullanılması halinde:
              </p>
              <ul className="mt-2 space-y-2">
                {[
                  "Alıcı, malı 10 (on) gün içinde Satıcı'ya iade etmekle yükümlüdür.",
                  "Ürünün orijinal ambalajında, kullanılmamış, yıkanmamış ve hasarsız biçimde iade edilmesi esastır. Etiketi çıkarılmış veya kullanılmış ürünlerin iadesi kabul edilmeyebilir.",
                  "İade kargo bedeli Alıcı tarafından karşılanır; ancak Satıcı'nın aksini kararlaştırdığı kampanya dönemlerinde ücretsiz iade sunulabilir.",
                  "Cayma hakkının geçerli biçimde kullanılması halinde ödenen tutar, iade malın Satıcı'ya ulaşmasından itibaren en geç 14 (on dört) gün içinde Alıcı'nın ödeme yöntemiyle iade edilir.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Madde 7 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 7 — Cayma Hakkının İstisnaları</h2>
              <p className="mb-3">
                Yönetmelik'in 15. maddesi uyarınca aşağıdaki durumlarda cayma hakkı kullanılamaz:
              </p>
              <ul className="space-y-2">
                {[
                  "Alıcı'nın isteğine veya açıkça kişisel ihtiyaçlarına göre üretilen (özel dikim/kişiselleştirilmiş) ürünler",
                  "Niteliği itibarıyla bozulma tehlikesi olan veya son kullanma tarihi geçme ihtimali bulunan ürünler",
                  "Teslim sonrası ambalajı açılan ve iadesi sağlık ve hijyen açısından uygun olmayan ürünler",
                  "Tesliminden sonra başka ürünlerle karışan ve ayrıştırılması mümkün olmayan ürünler",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Madde 8 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 8 — Garanti ve Ayıplı Mal</h2>
              <p>
                Tüm ürünler, TKHK hükümleri kapsamında <strong className="text-black">2 (iki) yıllık</strong>{" "}
                yasal garantiye tabidir. Ayıplı mal teslimi halinde Alıcı, teslim tarihinden itibaren
                2 yıl içinde aşağıdaki seçimlik haklardan birini kullanabilir:
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "Sözleşmeden dönme (iade ve tam bedel iadesi)",
                  "Ayıp oranında bedel indirimi",
                  "Ücretsiz onarım talebi",
                  "Ayıpsız misliyle değişim talebi",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Tüketici, ayıbı teslimden itibaren <strong className="text-black">2 ay</strong> içinde
                Satıcı'ya bildirmekle yükümlüdür.
              </p>
            </div>

            {/* Madde 9 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 9 — Gizlilik ve Kişisel Veriler</h2>
              <p>
                Alıcı'nın sipariş sürecinde paylaştığı kişisel veriler, yalnızca sözleşmenin ifası
                ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenir. Ayrıntılı bilgi için{" "}
                <Link href="/kvkk" className="underline hover:text-black transition">
                  KVKK Aydınlatma Metni
                </Link>{" "}
                incelenebilir.
              </p>
            </div>

            {/* Madde 10 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 10 — Uyuşmazlık Çözümü</h2>
              <p>
                İşbu Sözleşme'den doğan uyuşmazlıklarda, yürürlükteki mevzuatın belirlediği parasal
                sınırlar çerçevesinde <strong className="text-black">Tüketici Hakem Heyetleri</strong> yetkilidir.
                Parasal sınırı aşan uyuşmazlıklarda <strong className="text-black">Tüketici Mahkemeleri</strong>{" "}
                yetkili yargı mercidir.
              </p>
              <p className="mt-3">
                Tüketici Hakem Heyeti'ne başvuru için{" "}
                <a
                  href="https://tuketici.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black transition"
                >
                  tuketici.gov.tr
                </a>{" "}
                üzerinden e-Devlet aracılığıyla başvuru yapılabilir.
              </p>
            </div>

            {/* Madde 11 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 11 — Sözleşmenin Kurulması</h2>
              <p>
                Alıcı, ödeme adımında "Siparişi Tamamla" butonuna tıklayarak işbu Sözleşme'yi,
                Mesafeli Satış Ön Bilgilendirme Formu'nu okuduğunu ve tüm hükümlerini kabul ettiğini
                beyan etmiş sayılır. Sözleşme, ödemenin başarıyla gerçekleşmesi ve sipariş onay
                e-postasının Alıcı'ya iletilmesiyle birlikte kurulmuş olur.
              </p>
            </div>

            {/* Madde 12 */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 12 — Yürürlük</h2>
              <p>
                İşbu Sözleşme, Türkiye Cumhuriyeti hukukuna tabidir. Sözleşme, onaylanmış siparişlerde
                kalıcı veri saklayıcısına (e-posta) gönderilir ve Alıcı tarafından saklanabilir.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}
