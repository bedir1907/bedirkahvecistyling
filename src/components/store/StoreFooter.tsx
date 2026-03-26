export default function StoreFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-3">E-TİCARET</h3>
          <p className="text-gray-600 text-sm">
            Modern erkek giyim için sade ve güçlü bir alışveriş deneyimi.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Kurumsal</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Hakkımızda</li>
            <li>İletişim</li>
            <li>KVKK</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Müşteri Hizmetleri</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Kargo ve Teslimat</li>
            <li>İade ve Değişim</li>
            <li>Sık Sorulan Sorular</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Bülten</h4>
          <p className="text-sm text-gray-600">
            Kampanyalar ve yeni ürünlerden haberdar ol.
          </p>
        </div>
      </div>
    </footer>
  )
}