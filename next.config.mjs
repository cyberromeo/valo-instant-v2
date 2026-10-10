/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.valorant-api.com" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
  },
  outputFileTracingRoot: process.cwd(),
};
export default nextConfig;
