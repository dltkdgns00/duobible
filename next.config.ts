import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  // phone/LAN access during local testing
  allowedDevOrigins: ["172.30.1.37", "127.0.0.1", "localhost"],
};

export default nextConfig;
