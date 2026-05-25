import Link from "next/link"

type Props = {
  eyebrow?: string
  title: string
  description?: string
  href?: string
}

export default function SectionHeader({ eyebrow, title, description, href }: Props) {
  return (
    <div className="mb-6 px-4 md:px-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-lg uppercase tracking-[0.22em] text-gray-500 mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-5xl font-bold mb-3">{title}</h2>
        {description && <p className="text-xl text-gray-600">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-black/60 hover:text-black transition border-b border-black/20 hover:border-black pb-0.5 whitespace-nowrap"
        >
          Tümünü Gör →
        </Link>
      )}
    </div>
  )
}