import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false as any,
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
