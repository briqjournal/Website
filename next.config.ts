import type { NextConfig } from "next";
import legacyRedirects from "./app/legacy-redirects";

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
