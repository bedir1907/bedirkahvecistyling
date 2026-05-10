import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"

export const metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Bedir Kahveci Styling kişisel verilerin korunması aydınlatma metni.",
}

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">KVKK Aydınlatma Metni</span>
        </div>

        <div className="border border-black/10 rounded-[28px] bg-[#fcfcfb] px-6 py-8 md:px-10 md:py-12">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Yasal Bildirim</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Kişisel Verilerin Korunması<br />Aydınlatma Metni
          </h1>
          <p className="text-sm text-gray-500 mt-3">Son güncelleme: Mayıs 2025</p>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            <p>
              İşbu Aydınlatma Metni; veri sorumlusu sıfatıyla <strong className="text-black">Bedir Kahveci Styling</strong>{" "}
              ("Şirket", "biz") tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve
              ilgili ikincil mevzuat kapsamında, müşterilerimizin, ziyaretçilerimizin ve kullanıcılarımızın
              kişisel verilerinin nasıl toplandığı, işlendiği, aktarıldığı ve korunduğu hakkında
              şeffaf bir biçimde bilgi vermek amacıyla hazırlanmıştır.
            </p>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">1. Veri Sorumlusunun Kimliği</h2>
              <div className="bg-white border border-black/8 rounded-2xl px-5 py-4 space-y-1 text-sm">
                <p><span className="font-medium text-black w-40 inline-block">Unvan</span> Bedir Kahveci Styling</p>
                <p><span className="font-medium text-black w-40 inline-block">Adres</span> Yeniköy Mah. Amiral Şükrü Okan Cad. Altay Apartmanı No:26, Tirebolu / Giresun 28500</p>
                <p><span className="font-medium text-black w-40 inline-block">Vergi Dairesi</span> Tirebolu Vergi Dairesi</p>
                <p><span className="font-medium text-black w-40 inline-block">Vergi No</span> 4880688583</p>
                <p><span className="font-medium text-black w-40 inline-block">E-posta</span> info@bedirkahvecistyling.com</p>
                <p><span className="font-medium text-black w-40 inline-block">Telefon</span> +90 553 136 12 61</p>
                <p><span className="font-medium text-black w-40 inline-block">Web Sitesi</span> www.bedirkahvecistyling.com</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">2. İşlenen Kişisel Veriler</h2>
              <p className="mb-3">Aşağıda belirtilen kategorilerdeki kişisel verileriniz işlenebilmektedir:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-4 py-2.5 text-left rounded-tl-xl font-medium">Kategori</th>
                      <th className="px-4 py-2.5 text-left rounded-tr-xl font-medium">Veri Türleri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8">
                    {[
                      ["Kimlik Verileri", "Ad, soyad"],
                      ["İletişim Verileri", "E-posta adresi, telefon numarası, teslimat ve fatura adresi"],
                      ["Sipariş & İşlem Verileri", "Sipariş numarası, ürün bilgileri, sipariş tutarı, sipariş tarihi, kargo takip numarası"],
                      ["Ödeme Süreç Verileri", "Ödeme yöntemi türü, işlem referans kodu (kart/hesap bilgileri işlenmez; ödeme altyapısı Iyzico tarafından yürütülür)"],
                      ["Teknik & Kullanım Verileri", "IP adresi, tarayıcı türü, cihaz bilgisi, çerez verileri, ziyaret edilen sayfalar, ziyaret süresi"],
                      ["Müşteri İletişim Verileri", "Destek talepleri, şikayet ve öneri içerikleri, iletişim geçmişi"],
                    ].map(([cat, detail]) => (
                      <tr key={cat} className="even:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-black align-top">{cat}</td>
                        <td className="px-4 py-3 text-gray-600">{detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <ul className="space-y-2 list-none">
                {[
                  "Sipariş alma, doğrulama, hazırlama ve teslimat süreçlerinin yürütülmesi",
                  "Ödeme işlemlerinin gerçekleştirilmesi ve ödeme güvenliğinin sağlanması",
                  "Fatura düzenlenmesi ve muhasebe/vergi yükümlülüklerinin yerine getirilmesi",
                  "İade, değişim ve cayma hakkı taleplerinin işleme alınması",
                  "Müşteri hizmetleri, şikayet ve destek süreçlerinin yürütülmesi",
                  "Kullanıcı hesabının oluşturulması, yönetilmesi ve hesap güvenliğinin sağlanması",
                  "E-posta doğrulama ve şifre sıfırlama işlemlerinin gerçekleştirilmesi",
                  "Site güvenliğinin sağlanması, dolandırıcılık ve yetkisiz erişimlerin önlenmesi",
                  "Hukuki uyuşmazlıkların çözümünde delil ve kayıt yükümlülüğünün yerine getirilmesi",
                  "Yasal bildirim yükümlülüklerinin yerine getirilmesi (vergi dairesi, gümrük vb.)",
                  "Web sitesi işlevselliğinin ve kullanıcı deneyiminin geliştirilmesi",
                  "Açık rıza verilmesi halinde: e-bülten, kampanya ve kişiselleştirilmiş pazarlama iletişimi",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">4. Hukuki İşleme Sebepleri</h2>
              <div className="space-y-3">
                {[
                  ["Sözleşmenin kurulması veya ifası", "Sipariş, teslimat, iade ve müşteri hesabı işlemleri"],
                  ["Hukuki yükümlülüğün yerine getirilmesi", "Fatura düzenleme, vergi mevzuatı, tüketicinin korunması mevzuatı"],
                  ["Meşru menfaat", "Site güvenliği, dolandırıcılıkla mücadele, hizmet kalitesinin artırılması"],
                  ["Açık rıza", "Pazarlama iletişimi, çerez analitiği (yalnızca rıza verilen durumlarda)"],
                ].map(([sebep, aciklama]) => (
                  <div key={sebep} className="bg-white border border-black/8 rounded-2xl px-5 py-4">
                    <p className="font-semibold text-black text-sm">{sebep}</p>
                    <p className="text-sm text-gray-600 mt-1">{aciklama}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">5. Kişisel Verilerin Aktarımı</h2>
              <div className="space-y-2 text-sm">
                {[
                  ["Ödeme Kuruluşları", "Iyzico Ödeme Hizmetleri A.Ş. — ödeme işlemlerinin güvenli biçimde gerçekleştirilmesi"],
                  ["Kargo & Lojistik Firmaları", "Sipariş teslimatının sağlanması amacıyla anlaşmalı kargo şirketleri"],
                  ["Bulut & Altyapı Hizmetleri", "Neon (veritabanı), Cloudinary (görsel depolama), Resend (e-posta altyapısı)"],
                  ["Mali Müşavirlik / Muhasebe", "Fatura ve muhasebe yükümlülüklerinin yerine getirilmesi"],
                  ["Yetkili Kamu Kurum ve Kuruluşları", "Yasal zorunluluk, mahkeme kararı veya idari talep halinde"],
                ].map(([taraf, aciklama]) => (
                  <div key={taraf} className="flex gap-3 border-b border-black/6 py-3 last:border-0">
                    <span className="font-medium text-black min-w-[200px] shrink-0">{taraf}</span>
                    <span className="text-gray-600">{aciklama}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
                Kişisel verileriniz, yukarıda sayılanlar dışında üçüncü kişilerle ticari amaçla paylaşılmaz ve satılmaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">6. Saklama Süreleri</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-4 py-2.5 text-left rounded-tl-xl font-medium">Veri Kategorisi</th>
                      <th className="px-4 py-2.5 text-left rounded-tr-xl font-medium">Saklama Süresi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/8">
                    {[
                      ["Sipariş ve fatura kayıtları", "10 yıl (Türk Ticaret Kanunu ve Vergi Usul Kanunu gereği)"],
                      ["Müşteri hesap bilgileri", "Hesap aktif olduğu süre + hesap silinmesinden itibaren 3 yıl"],
                      ["Müşteri destek kayıtları", "Talebin kapanmasından itibaren 3 yıl"],
                      ["Ödeme işlem kayıtları", "10 yıl (ödeme mevzuatı gereği)"],
                      ["Web sitesi log kayıtları", "2 yıl (5651 sayılı Kanun gereği)"],
                      ["Pazarlama iletişimi", "Rıza geri çekilene kadar; rıza geri çekilmesinden sonra 3 yıl"],
                    ].map(([tur, sure]) => (
                      <tr key={tur} className="even:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-black align-top">{tur}</td>
                        <td className="px-4 py-3 text-gray-600">{sure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">7. İlgili Kişi Hakları (KVKK Madde 11)</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  ["🔍 Bilgi Edinme", "Kişisel verilerinizin işlenip işlenmediğini öğrenme"],
                  ["📋 Bilgi Talep Etme", "İşlenmiş verilere ilişkin bilgi alma"],
                  ["🎯 Amaç Sorgulama", "Verilerin hangi amaçla işlendiğini öğrenme"],
                  ["🌐 Aktarım Bilgisi", "Verilerin kimlere aktarıldığını öğrenme"],
                  ["✏️ Düzeltme", "Eksik veya yanlış verilerin düzeltilmesini isteme"],
                  ["🗑️ Silme", "Yasal saklama süresi dolmuş verilerin silinmesini isteme"],
                  ["❌ İtiraz", "Otomatik sistemler aracılığıyla aleyhine sonuç doğurmasına itiraz"],
                  ["⚖️ Tazminat", "Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme"],
                ].map(([hak, aciklama]) => (
                  <div key={hak} className="bg-white border border-black/8 rounded-xl px-4 py-3">
                    <p className="font-semibold text-sm text-black">{hak}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-5">{aciklama}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">8. Başvuru Yöntemi</h2>
              <p className="mb-4">
                KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki kanallardan bize ulaşabilirsiniz.
                Başvurular yasal süre olan <strong className="text-black">30 gün</strong> içinde yanıtlanır.
              </p>
              <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-black">E-posta:</span>{" "}
                  <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
                    info@bedirkahvecistyling.com
                  </a>{" "}
                  — Konu: "KVKK Başvurusu"
                </p>
                <p>
                  <span className="font-semibold text-black">Posta:</span>{" "}
                  Yeniköy Mah. Amiral Şükrü Okan Cad. Altay Apartmanı No:26, Tirebolu / Giresun 28500
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">9. Çerezler</h2>
              <p>
                Web sitemizde kullandığımız çerezler hakkında ayrıntılı bilgiye{" "}
                <Link href="/cerez-politikasi" className="underline hover:text-black transition">Çerez Politikamız</Link>{" "}
                sayfasından ulaşabilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}