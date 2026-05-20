import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400 mb-6">
          Bedir Kahveci Styling
        </p>
        <h1 className="text-8xl font-semibold tracking-tight mb-4">404</h1>
        <p className="text-gray-500 text-lg mb-2">Sayfa bulunamadı</p>
        <p className="text-gray-400 text-sm mb-10">
          Aradığınız sayfa kaldırılmış, taşınmış ya da hiç var olmamış olabilir.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:opacity-90 transition"
        >
          Anasayfaya Dön
        </Link>
      </div>
    </main>
  )
}
