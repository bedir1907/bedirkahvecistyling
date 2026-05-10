"use client"

import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

type HomepageSettings = {
  announcementEnabled: boolean
  announcementText: string | null
  announcementLink: string | null
  announcementLinkLabel: string | null
}

export default function AnnouncementBar() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null)
  const [duration, setDuration] = useState(20)

  const groupRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/homepage", { cache: "no-store" })
        const data = await res.json()
        setSettings(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  useLayoutEffect(() => {
    function calculateDuration() {
      if (!groupRef.current) return

      const width = groupRef.current.scrollWidth

      // Sabit akış hızı: saniyede 80 px
      const pixelsPerSecond = 80
      const nextDuration = Math.max(width / pixelsPerSecond, 12)

      setDuration(nextDuration)
    }

    calculateDuration()
    window.addEventListener("resize", calculateDuration)

    return () => {
      window.removeEventListener("resize", calculateDuration)
    }
  }, [settings])

  if (!settings?.announcementEnabled) return null
  if (!settings.announcementText?.trim()) return null

  const link = settings.announcementLink?.trim()
  const linkLabel = settings.announcementLinkLabel?.trim()

  const AnnouncementUnit = () => (
    <div className="announcement-unit">
      <span>{settings.announcementText}</span>

      {link && linkLabel ? (
        <>
          <span className="announcement-separator">•</span>
          <Link href={link} className="underline hover:opacity-80 transition">
            {linkLabel}
          </Link>
        </>
      ) : null}
    </div>
  )

  return (
    <div className="announcement-container bg-black text-white">
      <div
        className="announcement-marquee"
        style={{ animationDuration: `${duration}s` }}
      >
        <div ref={groupRef} className="announcement-group">
          <AnnouncementUnit />
          <AnnouncementUnit />
          <AnnouncementUnit />
        </div>

        <div className="announcement-group" aria-hidden="true">
          <AnnouncementUnit />
          <AnnouncementUnit />
          <AnnouncementUnit />
        </div>
      </div>
    </div>
  )
}