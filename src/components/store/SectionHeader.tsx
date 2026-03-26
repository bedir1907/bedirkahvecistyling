type Props = {
  eyebrow?: string
  title: string
  description?: string
}

export default function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="text-lg uppercase tracking-[0.22em] text-gray-500 mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-5xl font-bold mb-3">{title}</h2>
      {description && <p className="text-xl text-gray-600">{description}</p>}
    </div>
  )
}