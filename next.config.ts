import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "www.livelikeitstheweekend.com",
      },
      {
        protocol: "https",
        hostname: "isde-congress.net",
      },
    ],
  },
};

export default nextConfig;
