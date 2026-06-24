import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    let apiUrl: string;
    if (process.env.NEXT_PUBLIC_API_URL) {
      apiUrl = process.env.NEXT_PUBLIC_API_URL;
    } else if (process.env.VERCEL_URL) {
      // Vercel auto-sets VERCEL_URL — backend service is on same domain at /_/backend
      apiUrl = `https://${process.env.VERCEL_URL}/_/backend`;
    } else {
      apiUrl = "http://localhost:8000";
    }
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
