/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      { source: "/circles", destination: "/feed", permanent: false },
      { source: "/circles/:path*", destination: "/feed", permanent: false },
      { source: "/c/:path*", destination: "/feed", permanent: false },
      { source: "/network", destination: "/feed", permanent: false },
      { source: "/network/:path*", destination: "/feed", permanent: false },
      { source: "/messages", destination: "/feed", permanent: false },
      { source: "/messages/:path*", destination: "/feed", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
