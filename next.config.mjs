/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep GitHub Pages static site as is, Next.js runs as server.
  // For static export to Pages, uncomment: output: 'export',
  reactStrictMode: true,
  // Allow builds without full DB connection (page.tsx is static)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Ensure the standalone output can be deployed to any Node host
  // output: 'standalone',
};

export default nextConfig;
