// BK monogramı: harfler sırayla çizilir, dış halkada ince bir yay döner.
const LETTER_PATHS = [
  "M97 87H165C184.9 87 201 103.1 201 123C201 142.9 184.9 159 165 159H117",
  "M117 159H168C188.4 159 205 175.6 205 196C205 216.4 188.4 233 168 233H97",
  "M156 123V276",
  "M97 233H156",
  "M210 276V164",
  "M210 235L281 88",
  "M235 184L292 276",
]

/** Animasyonlu logo (loader ve giriş splash'ı ortak kullanır). */
export function LogoMark() {
  return (
    <>
      <svg width="96" height="96" viewBox="0 0 360 360" fill="none" aria-hidden="true">
        <circle cx="180" cy="180" r="154" stroke="#EDEDED" strokeWidth="5" />
        <circle
          className="bk-loader-orbit"
          cx="180"
          cy="180"
          r="154"
          stroke="#050505"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="18 82"
        />
        {LETTER_PATHS.map((d, i) => (
          <path
            key={d}
            className="bk-loader-stroke"
            d={d}
            pathLength={1}
            stroke="#050505"
            strokeWidth="7"
            strokeLinecap="square"
            style={{ animationDelay: `${i * 0.09}s` }}
          />
        ))}
      </svg>
      <span className="bk-loader-text mt-6 text-[10px] font-medium uppercase tracking-[0.45em] text-neutral-900">
        Bedir Kahveci
      </span>
    </>
  )
}

export default function LogoLoader() {
  return (
    <div
      className="bk-loader fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <LogoMark />
      <span className="sr-only">Yükleniyor</span>
    </div>
  )
}
