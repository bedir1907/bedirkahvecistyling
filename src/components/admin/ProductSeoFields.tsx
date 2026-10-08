"use client"

const META_TITLE_MAX = 60
const META_DESCRIPTION_MAX = 160

type Props = {
  metaTitle: string
  metaDescription: string
  onChange: (field: "metaTitle" | "metaDescription", value: string) => void
  inputClassName?: string
}

function Counter({ length, max }: { length: number; max: number }) {
  const over = length > max
  return (
    <span className={`text-xs tabular-nums ${over ? "text-red-600 font-medium" : "text-gray-400"}`}>
      {length}/{max}
    </span>
  )
}

/** Ürün formlarında Google sonuçlarında görünen başlık/açıklama alanları (opsiyonel). */
export default function ProductSeoFields({ metaTitle, metaDescription, onChange, inputClassName }: Props) {
  const cls =
    inputClassName ??
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
            Meta başlık <span className="text-gray-400 font-normal">opsiyonel</span>
          </label>
          <Counter length={metaTitle.trim().length} max={META_TITLE_MAX} />
        </div>
        <input
          id="metaTitle"
          name="metaTitle"
          value={metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          maxLength={120}
          className={cls}
          placeholder="ör: Beyaz Keten Gömlek - Erkek Oversize Gömlek"
        />
        <p className="text-xs text-gray-400 mt-1">
          Boş bırakılırsa otomatik oluşturulur (ürün adı + renk). Sonuna &quot;| Bedir Kahveci Styling&quot; eklenir.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
            Meta açıklama <span className="text-gray-400 font-normal">opsiyonel</span>
          </label>
          <Counter length={metaDescription.trim().length} max={META_DESCRIPTION_MAX} />
        </div>
        <textarea
          id="metaDescription"
          name="metaDescription"
          value={metaDescription}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          maxLength={320}
          rows={3}
          className={`${cls} resize-none`}
          placeholder="Google arama sonucunda başlığın altında görünen kısa metin"
        />
        <p className="text-xs text-gray-400 mt-1">
          Boş bırakılırsa otomatik oluşturulur (ürün açıklamasından; o da boşsa ad, renk, beden ve fiyattan).
        </p>
      </div>
    </div>
  )
}
