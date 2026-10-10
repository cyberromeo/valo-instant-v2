/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.valorant-api.com" }],
    unoptimized: true,
  },
  outputFileTracingRoot: process.cwd(),
};
export default nextConfig;
