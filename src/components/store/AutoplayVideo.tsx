"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  src: string
  className?: string
  fit?: "cover" | "contain"
  desktopFit?: "cover" | "contain" | "auto"
}

export default function AutoplayVideo({ src, className = "", fit = "cover", desktopFit }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [autoDesktopFit, setAutoDesktopFit] = useState<"cover" | "contain">("cover")

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.muted = true

    const tryPlay = () => el.play().catch(() => {})

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) tryPlay() },
      { threshold: 0.1 }
    )

    observer.observe(el)

    const unlock = () => { tryPlay(); document.removeEventListener("touchstart", unlock) }
    document.addEventListener("touchstart", unlock, { passive: true })

    return () => {
      observer.disconnect()
      document.removeEventListener("touchstart", unlock)
    }
  }, [src])

  const resolvedDesktopFit = desktopFit === "auto" ? autoDesktopFit : desktopFit
  const fitClass = [
    fit === "contain" ? "object-contain" : "object-cover",
    resolvedDesktopFit ? (resolvedDesktopFit === "contain" ? "md:object-contain" : "md:object-cover") : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      className={`absolute inset-0 h-full w-full ${fitClass}`}
      onLoadedMetadata={(event) => {
        const video = event.currentTarget
        setAutoDesktopFit(video.videoWidth >= video.videoHeight ? "cover" : "contain")
      }}
      style={{ pointerEvents: "none" }}
    />
  )
}
