"use client"

import { useRef } from "react"

type Props = {
  children: React.ReactNode
}

export default function HorizontalSlider({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  function getScrollAmount() {
    if (!containerRef.current) return 0

    const firstCard = containerRef.current.querySelector(
      "[data-slider-item='true']"
    ) as HTMLElement | null

    if (!firstCard) return 0

    const styles = window.getComputedStyle(containerRef.current.firstElementChild as Element)
    const gap = parseInt(styles.columnGap || styles.gap || "24", 10)

    return firstCard.offsetWidth + gap
  }

  function scrollLeft() {
    if (!containerRef.current) return

    containerRef.current.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    })
  }

  function scrollRight() {
    if (!containerRef.current) return

    containerRef.current.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-lg"
      >
        ←
      </button>

      <div
        ref={containerRef}
        className="overflow-x-auto scroll-smooth no-scrollbar px-14"
      >
        <div className="flex gap-6 min-w-max">{children}</div>
      </div>

      <button
        type="button"
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border shadow rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-50 text-lg"
      >
        →
      </button>
    </div>
  )
}