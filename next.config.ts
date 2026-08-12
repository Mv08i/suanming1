import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        // Next.js 带 hash 的静态资源：immutable，一年不过期
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // public 目录下的图片、字体、svg
        source: "/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|otf)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
