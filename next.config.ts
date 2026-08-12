import type { NextConfig } from "next";

// Vercel 部署时，rootDirectory = "A"，process.cwd() 即 A 目录本身
// 本地构建时也应在 A 目录内执行，依赖都安装在 A/node_modules 下
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
