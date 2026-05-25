"use client"

import { useEffect, useRef } from "react"

type Props = {
  src: string
  style?: React.CSSProperties
  className?: string
}

export default function AutoplayVideo({ src, style, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.muted = true

    const tryPlay = () => el.play().catch(() => {})

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay()
        else el.pause()
      },
      { threshold: 0.1 }
    )

    observer.observe(el)

    // iOS: ilk dokunuşta unlock et
    const unlock = () => { tryPlay(); document.removeEventListener("touchstart", unlock) }
    document.addEventListener("touchstart", unlock, { passive: true })

    return () => {
      observer.disconnect()
      document.removeEventListener("touchstart", unlock)
    }
  }, [src])

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      style={{ pointerEvents: "none", ...style }}
      className={className}
    />
  )
}
