export default function AnnouncementBar() {
  return (
    <div className="bg-black text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 tracking-wide">
        <span>16:30&apos;a kadar verilen siparişler aynı gün kargoda</span>
        <span className="hidden md:block">•</span>
        <span>2000 TL ve üzeri ücretsiz kargo</span>
      </div>
    </div>
  )
}