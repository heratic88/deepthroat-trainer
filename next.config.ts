import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/deepthroat-trainer",
  images: { unoptimized: true },
};

export default nextConfig;
