import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

await jiti.import("./src/env", { default: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
    typedRoutes: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
