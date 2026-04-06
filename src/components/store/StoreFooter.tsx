import Link from "next/link"

export default function StoreFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#fafaf8] text-black mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link
              href="/"
              className="inline-block text-2xl font-semibold tracking-[0.18em] leading-none"
            >
              E-TİCARET
            </Link>

            <p className="text-gray-600 mt-5 leading-7 max-w-xs">
              Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Kurumsal</h3>
            <div className="space-y-3 text-gray-600">
              <Link href="/hakkimizda" className="block hover:text-black transition">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="block hover:text-black transition">
                İletişim
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Yasal</h3>
            <div className="space-y-3 text-gray-600">
              <Link href="/kvkk" className="block hover:text-black transition">
                KVKK Aydınlatma Metni
              </Link>
              <Link href="/cerez-politikasi" className="block hover:text-black transition">
                Çerez Politikası
              </Link>
              <Link
                href="/mesafeli-satis-on-bilgilendirme"
                className="block hover:text-black transition"
              >
                Ön Bilgilendirme Formu
              </Link>
              <Link
                href="/mesafeli-satis-sozlesmesi"
                className="block hover:text-black transition"
              >
                Mesafeli Satış Sözleşmesi
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Müşteri Hizmetleri</h3>
            <div className="space-y-3 text-gray-600">
              <Link
                href="/kargo-ve-teslimat"
                className="block hover:text-black transition"
              >
                Kargo ve Teslimat
              </Link>
              <Link
                href="/iade-ve-degisim"
                className="block hover:text-black transition"
              >
                İade ve Değişim
              </Link>
              <Link
                href="/sikca-sorulan-sorular"
                className="block hover:text-black transition"
              >
                Sık Sorulan Sorular
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-black/10 text-sm text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>© 2026 E-TİCARET. Tüm hakları saklıdır.</p>
          <p>Güvenli ödeme • Hızlı teslimat • Kolay iade</p>
        </div>
      </div>
    </footer>
  )
}