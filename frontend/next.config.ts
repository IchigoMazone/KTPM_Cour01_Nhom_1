import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1:3000", "localhost:3000", "192.168.5.114:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-mockup-r2.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
