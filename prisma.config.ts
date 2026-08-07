/**
 * Prisma 显式配置 —— Vercel 构建环境不会自动探测到 prisma/schema.prisma，
 * 这里通过官方配置文件声明 schema 路径，确保 prisma generate / migrate deploy
 * 在任何工作目录下都能找到 schema。
 *
 * See: https://pris.ly/d/prisma-config
 */
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
});
