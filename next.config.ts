import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["iyzipay"],
  outputFileTracingIncludes: {
    "/api/payment/iyzico/initialize": [
      "./node_modules/iyzipay/lib/resources/**/*",
    ],
    "/api/payment/iyzico/callback": [
      "./node_modules/iyzipay/lib/resources/**/*",
    ],
    "/api/payment/iyzico/verify": [
      "./node_modules/iyzipay/lib/resources/**/*",
    ],
    "/api/payment/iyzico/webhook": [
      "./node_modules/iyzipay/lib/resources/**/*",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig