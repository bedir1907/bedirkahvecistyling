"use client"

import { useId } from "react"

export const META_TITLE_LIMIT = 60
export const META_DESCRIPTION_LIMIT = 160

type Values = {
  metaTitle: string
  metaDescription: string
}

type Props = {
  values: Values
  onChange: (field: keyof Values, value: string) => void
  /** Boş bırakıldığında kullanılacak otomatik başlık/açıklama önizlemesi (opsiyonel). */
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  inputClassName?: string
  labelClassName?: string
}

function Counter({ length, limit }: { length: number; limit: number }) {
  return (
    <span className={`text-xs tabular-nums ${length > limit ? "text-red-600 font-medium" : "text-gray-400"}`}>
      {length}/{limit}
    </span>
  )
}

/** Admin formları için Meta başlık / Meta açıklama alanları (karakter sayaçlı). */
export default function SeoMetaFields({
  values,
  onChange,
  titlePlaceholder,
  descriptionPlaceholder,
  inputClassName = "w-full border rounded px-4 py-3",
  labelClassName = "block font-medium",
}: Props) {
  const id = useId()
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <label htmlFor={`${id}-title`} className={labelClassName}>Meta başlık</label>
          <Counter length={values.metaTitle.length} limit={META_TITLE_LIMIT} />
        </div>
        <input
          id={`${id}-title`}
          value={values.metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          maxLength={120}
          className={inputClassName}
          placeholder={titlePlaceholder}
        />
        <p className="text-xs text-gray-500 mt-1">
          Boş bırakılırsa otomatik oluşturulur. Google ~60 karakter gösterir; marka adı yazılmazsa sonuna &quot;| Bedir Kahveci Styling&quot; eklenir.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <label htmlFor={`${id}-description`} className={labelClassName}>Meta açıklama</label>
          <Counter length={values.metaDescription.length} limit={META_DESCRIPTION_LIMIT} />
        </div>
        <textarea
          id={`${id}-description`}
          value={values.metaDescription}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          maxLength={320}
          rows={3}
          className={`${inputClassName} resize-y`}
          placeholder={descriptionPlaceholder}
        />
        <p className="text-xs text-gray-500 mt-1">
          Boş bırakılırsa otomatik oluşturulur. Arama sonuçlarında görünen kısa özet (önerilen en fazla 160 karakter).
        </p>
      </div>
    </div>
  )
}
