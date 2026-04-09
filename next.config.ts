import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["iyzipay"],
  outputFileTracingIncludes: {
    "/api/payment/iyzico/initialize": [
      "./node_modules/iyzipay/lib/**/*",
    ],
    "/api/payment/iyzico/callback": [
      "./node_modules/iyzipay/lib/**/*",
    ],
    "/api/payment/iyzico/verify": [
      "./node_modules/iyzipay/lib/**/*",
    ],
    "/api/payment/iyzico/webhook": [
      "./node_modules/iyzipay/lib/**/*",
    ],
    "/api/admin/orders/[id]/refund": [
      "./node_modules/iyzipay/lib/**/*",
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