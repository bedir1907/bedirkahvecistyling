export default function AdminAnalyticsPage() {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analiz</h1>
        <p className="text-gray-600 mt-2">
          Satış ve performans verileri burada gösterilecek.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Analiz ekranı hazırlanıyor
        </h2>
        <p className="text-gray-600 leading-7">
          Sipariş ve ödeme sistemi tamamlandığında burada:
          toplam sipariş, ciro, en çok satan ürünler, kategori performansı ve
          zaman bazlı raporlar gösterilecek.
        </p>
      </div>
    </main>
  )
}