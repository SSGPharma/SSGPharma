import type { NextConfig } from "next"

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
const cdnPattern = (() => {
  if (!cdnUrl) return [];
  try {
    const url = new URL(cdnUrl);
    if (url.protocol !== "https:" || url.username || url.password) return [];
    return [{ protocol: "https" as const, hostname: url.hostname, port: url.port, pathname: "/**", search: "" }];
  } catch { return []; }
})();

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "",
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: cdnPattern,
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
