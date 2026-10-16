import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "",
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV !== "production",
  },
  async redirects() {
    return [{ source: "/get-a-quote", destination: "/contact-us", permanent: true }];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
