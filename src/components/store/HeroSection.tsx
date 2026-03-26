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

export default function HeroSection() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchHomepageSettings() {
      try {
        const res = await fetch("/api/homepage")
        const data = await res.json()

        if (!res.ok) {
          console.error(data.error || "Hero verisi alınamadı")
          return
        }

        setSettings(data)
      } catch (error) {
        console.error("Hero fetch hatası:", error)
      }
    }

    fetchHomepageSettings()
  }, [])

  const cards = useMemo(() => {
    return [
      settings?.heroCard1Enabled
        ? {
            title: settings.heroCard1Title,
            image: settings.heroCard1Image,
            link: settings.heroCard1Link,
          }
        : null,
      settings?.heroCard2Enabled
        ? {
            title: settings.heroCard2Title,
            image: settings.heroCard2Image,
            link: settings.heroCard2Link,
          }
        : null,
    ].filter(Boolean) as {
      title: string | null
      image: string | null
      link: string | null
    }[]
  }, [settings])

  useEffect(() => {
    if (currentCardIndex > cards.length - 1) {
      setCurrentCardIndex(0)
    }
  }, [cards, currentCardIndex])

 function safeSetCard(nextIndex: number) {
  if (isAnimating || cards.length <= 1) return

  setIsAnimating(true)
  setCurrentCardIndex(nextIndex)

  setTimeout(() => {
    setIsAnimating(false)
  }, 400)
}

function goPrevCard() {
  const nextIndex =
    currentCardIndex === 0 ? cards.length - 1 : currentCardIndex - 1

  safeSetCard(nextIndex)
}

function goNextCard() {
  const nextIndex =
    currentCardIndex === cards.length - 1 ? 0 : currentCardIndex + 1

  safeSetCard(nextIndex)
}

  useEffect(() => {
  if (cards.length <= 1) return

  if (autoSlideRef.current) {
    clearInterval(autoSlideRef.current)
  }

  autoSlideRef.current = setInterval(() => {
    setCurrentCardIndex((prev) =>
      prev === cards.length - 1 ? 0 : prev + 1
    )
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

    if (Math.abs(diff) < 40) return

    if (diff > 0) {
      goNextCard()
    } else {
      goPrevCard()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const activeCard = cards[currentCardIndex] || null

  return (
    <section className="bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-lg uppercase tracking-[0.28em] text-gray-500 mb-4">
            {settings?.heroEyebrow || "Yeni Sezon"}
          </p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-5">
            {settings?.heroTitle || "En Tarz Ürünler"}
          </h1>

          <p className="text-gray-600 text-xl mb-8 max-w-2xl leading-8">
            {settings?.heroSubtitle ||
              "Modern, sade ve güçlü erkek giyim parçaları. Günlük stil ile premium görünümü tek vitrinde birleştir."}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={settings?.heroButtonLink || "/category/new-season"}
              className="bg-black text-white px-7 py-4 rounded hover:opacity-90 text-lg"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:bg-white transition z-10 text-2xl"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={goNextCard}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:bg-white transition z-10 text-2xl"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="relative overflow-hidden rounded-2xl">
                <Link href={activeCard.link || "#"} className="group block">
                  <div
                    key={currentCardIndex}
                    className="aspect-[4/5] border bg-gray-200 bg-cover bg-center relative overflow-hidden animate-[fadeIn_.35s_ease]"
                    style={
                      activeCard.image
                        ? { backgroundImage: `url(${activeCard.image})` }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="text-3xl md:text-4xl font-semibold drop-shadow">
                        {activeCard.title || "Kart Başlığı"}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {cards.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  {cards.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentCardIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        currentCardIndex === index
                          ? "w-10 bg-black"
                          : "w-2.5 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/5] rounded-2xl border bg-gray-200" />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0.75;
            transform: scale(0.985);
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