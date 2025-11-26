import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 이미지 업로드를 위해 10MB로 설정
    },
  },
} satisfies NextConfig;

export default nextConfig;
