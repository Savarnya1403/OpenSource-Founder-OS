import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // On Vercel: set NEXT_PUBLIC_API_URL=/_/backend (routes to FastAPI service on same domain)
    // Locally: NEXT_PUBLIC_API_URL=http://localhost:8000 (in .env.local)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
