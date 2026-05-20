"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

type HomepageSettings = {
  heroEyebrow: string
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  heroButtonLink: string

  heroCard1Enabled: boolean
  heroCard1Title: string | null
  heroCard1Image: string | null
  heroCard1Link: string | null

  heroCard2Enabled: boolean
  heroCard2Title: string | null
  heroCard2Image: string | null
  heroCard2Link: string | null
}

type HeroCard = {
  title: string | null
  image: string | null
  link: string | null
}

export default function HeroSection({ initialSettings }: { initialSettings: HomepageSettings | null }) {
  const [settings] = useState<HomepageSettings | null>(initialSettings)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  const cards = useMemo(() => {
    const nextCards: HeroCard[] = []

    if (settings?.heroCard1Enabled) {
      nextCards.push({
        title: settings.heroCard1Title,
        image: settings.heroCard1Image,
        link: settings.heroCard1Link,
      })
    }

    if (settings?.heroCard2Enabled) {
      nextCards.push({
        title: settings.heroCard2Title,
        image: settings.heroCard2Image,
        link: settings.heroCard2Link,
      })
    }

    return nextCards
  }, [settings])

  const safeCardIndex = cards.length === 0 ? 0 : Math.min(currentCardIndex, cards.length - 1)

  function safeSetCard(nextIndex: number) {
    if (isAnimating || cards.length <= 1) return

    setIsAnimating(true)
    setCurrentCardIndex(nextIndex)

    window.setTimeout(() => {
      setIsAnimating(false)
    }, 350)
  }

  function goPrevCard() {
    if (cards.length <= 1) return

    const nextIndex =
      safeCardIndex === 0 ? cards.length - 1 : safeCardIndex - 1

    safeSetCard(nextIndex)
  }

  function goNextCard() {
    if (cards.length <= 1) return

    const nextIndex =
      safeCardIndex === cards.length - 1 ? 0 : safeCardIndex + 1

    safeSetCard(nextIndex)
  }

  useEffect(() => {
    if (cards.length <= 1) return

    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current)
    }

    autoSlideRef.current = setInterval(() => {
      setCurrentCardIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }
  }, [cards.length])

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.changedTouches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    touchEndX.current = e.changedTouches[0].clientX

    if (touchStartX.current === null || touchEndX.current === null) return

    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) < 40) {
      touchStartX.current = null
      touchEndX.current = null
      return
    }

    if (diff > 0) {
      goNextCard()
    } else {
      goPrevCard()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const activeCard = cards[safeCardIndex] || null
  const heroButtonLink =
    settings?.heroButtonLink && settings.heroButtonLink.trim().length > 0
      ? settings.heroButtonLink
      : "/"

  return (
    <section className="bg-[#f7f7f5] border-b">
      <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-sm md:text-base uppercase tracking-[0.32em] text-gray-500 mb-4">
              {settings?.heroEyebrow || "Yeni Sezon"}
            </p>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight mb-5">
              {settings?.heroTitle || "Tarzını Yükselt"}
            </h1>

            <p className="text-gray-600 text-lg md:text-xl leading-8 max-w-2xl mb-8">
              {settings?.heroSubtitle ||
                "Minimal, güçlü ve modern parçalarla stilini tek dokunuşta tamamla."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={heroButtonLink}
                className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-xl hover:opacity-90 transition text-base md:text-lg font-medium tracking-wide"
              >
                {settings?.heroButtonText || "Alışverişe Başla"}
              </Link>
            </div>
          </div>

          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeCard ? (
              <>
                {cards.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevCard}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition text-xl"
                      aria-label="Önceki kart"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={goNextCard}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition text-xl"
                      aria-label="Sonraki kart"
                    >
                      ›
                    </button>
                  </>
                )}

                <div className="relative overflow-hidden rounded-[28px] shadow-sm">
                  <Link href={activeCard.link || "#"} className="group block">
                    <div
                      key={safeCardIndex}
                      className="aspect-[4/5] bg-gray-200 bg-cover bg-center relative overflow-hidden animate-[heroFadeIn_.35s_ease]"
                      style={
                        activeCard.image
                          ? { backgroundImage: `url(${activeCard.image})` }
                          : undefined
                      }
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition duration-300" />

                      {activeCard.title && (
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
                          <h2 className="max-w-[85%] text-2xl md:text-4xl font-semibold leading-tight drop-shadow-sm">
                            {activeCard.title}
                          </h2>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                {cards.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-5">
                    {cards.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => safeSetCard(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          safeCardIndex === index
                            ? "w-10 bg-black"
                            : "w-2.5 bg-gray-300"
                        }`}
                        aria-label={`Kart ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[4/5] rounded-[28px] border bg-gray-200" />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0.8;
            transform: scale(0.988);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  )
}
