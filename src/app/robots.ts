import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bedirkahvecistyling.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/bksy0net1mp4neli", "/api/", "/checkout", "/siparis"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
