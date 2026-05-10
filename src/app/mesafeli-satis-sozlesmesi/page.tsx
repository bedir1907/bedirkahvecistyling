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
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Mesafeli Satış Sözleşmesi</h1>
          <p className="text-sm text-gray-500 mt-3">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır. Son güncelleme: Mayıs 2025
          </p>

          <div className="mt-10 space-y-8 text-gray-700 leading-8">

            <div>
              <h2 className="text-xl font-semibold text-black mb-4">Madde 1 — Taraflar</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 space-y-1 text-sm">
                  <p className="font-semibold text-black text-base mb-2">SATICI</p>
                  <p><span className="text-gray-500 w-28 inline-block">Unvan</span> Bedir Kahveci Styling</p>
                  <p><span className="text-gray-500 w-28 inline-block">Adres</span> Yeniköy Mah. Amiral Şükrü Okan Cad. Altay Apartmanı No:26, Tirebolu / Giresun 28500</p>
                  <p><span className="text-gray-500 w-28 inline-block">Vergi Dairesi</span> Tirebolu</p>
                  <p><span className="text-gray-500 w-28 inline-block">Vergi No</span> 4880688583</p>
                  <p><span className="text-gray-500 w-28 inline-block">Telefon</span> +90 553 136 12 61</p>
                  <p><span className="text-gray-500 w-28 inline-block">E-posta</span> info@bedirkahvecistyling.com</p>
                  <p><span className="text-gray-500 w-28 inline-block">Web Sitesi</span> www.bedirkahvecistyling.com</p>
                </div>
                <div className="bg-white border border-black/8 rounded-2xl px-5 py-5 space-y-1 text-sm">
                  <p className="font-semibold text-black text-base mb-2">ALICI</p>
                  <p className="text-gray-600">Sipariş formunda belirtilen ad, soyad, teslimat adresi, e-posta ve telefon numarasına sahip tüketicidir.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 2 — Sözleşmenin Konusu</h2>
              <p>
                İşbu Sözleşme; Alıcı'nın <strong className="text-black">www.bedirkahvecistyling.com</strong> adresindeki internet sitesi
                üzerinden elektronik ortamda sipariş verdiği giyim ürünleri ile ilgili mal satışı ve teslimatına ilişkin
                tarafların hak ve yükümlülüklerini, 6502 sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği hükümleri
                çerçevesinde düzenlemektedir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 3 — Ürün Bilgileri</h2>
              <p>
                Sözleşme konusu ürünlerin temel özellikleri (beden, renk, materyal, bakım talimatları), satış fiyatı
                (KDV dahil), ödeme ve teslimat bilgileri sipariş özeti sayfasında gösterilir ve Alıcı tarafından onaylanır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 4 — Fiyat ve Ödeme</h2>
              <p>
                Ürün fiyatları Türk Lirası (TL) cinsinden ve KDV dahil olarak belirtilmektedir. Ödemeler,
                Iyzico Ödeme Hizmetleri A.Ş. altyapısı üzerinden 3D Secure güvencesiyle gerçekleştirilmektedir.
                Kart bilgileri Satıcı sunucularında saklanmaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 5 — Teslimat</h2>
              <p>
                Siparişler, ödemenin onaylanmasının ardından en fazla <strong className="text-black">30 (otuz) iş günü</strong> içinde
                teslim edilir; olağan durumlarda 3–7 iş günü içinde kargoya verilir. Teslimat, Alıcı'nın belirttiği
                adrese yapılır.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 6 — Cayma Hakkı</h2>
              <p>
                Alıcı, malı teslim aldığı tarihten itibaren <strong className="text-black">14 (on dört) gün</strong> içinde
                herhangi bir gerekçe göstermeksizin sözleşmeden cayma hakkına sahiptir. Cayma bildirimi{" "}
                <a href="mailto:info@bedirkahvecistyling.com" className="underline hover:text-black transition">
                  info@bedirkahvecistyling.com
                </a>{" "}
                adresine iletilir. Alıcı ürünü 10 gün içinde iade eder; Satıcı bedeli 14 gün içinde iade eder.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 7 — Cayma Hakkı İstisnaları</h2>
              <ul className="space-y-2">
                {[
                  "Alıcı'ya özel üretilen veya kişiselleştirilen ürünler",
                  "Hijyen gerekçesiyle ambalajı açıldıktan sonra iade edilemeyen ürünler",
                  "Kullanılmış, yıkanmış veya etiketi çıkarılmış ürünler",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 8 — Garanti</h2>
              <p>
                Tüm ürünler TKHK kapsamında <strong className="text-black">2 (iki) yıllık</strong> yasal garantiye tabidir.
                Ayıplı mal tesliminde Alıcı; sözleşmeden dönme, bedel indirimi, ücretsiz onarım veya
                ayıpsız misliyle değişim haklarından birini kullanabilir.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 9 — Uyuşmazlık Çözümü</h2>
              <p>
                Uyuşmazlıklarda yasal sınırlar dahilinde <strong className="text-black">Tüketici Hakem Heyetleri</strong> ve
                yetkili <strong className="text-black">Tüketici Mahkemeleri</strong> yetkilidir. Online başvuru:{" "}
                <a href="https://tuketici.gov.tr" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition">tuketici.gov.tr</a>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-black mb-3">Madde 10 — Yürürlük</h2>
              <p>
                Alıcı, ödeme adımında "Siparişi Tamamla" butonuna tıklayarak işbu Sözleşme'yi okuduğunu
                ve kabul ettiğini beyan etmiş sayılır.
              </p>
            </div>

          </div>
        </div>
      </section>
      <StoreFooter />
    </main>
  )
}