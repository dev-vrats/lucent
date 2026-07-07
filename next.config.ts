import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'mammoth', 'jose', 'jwks-rsa'],
};

export default nextConfig;
