import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack(config: any) {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    });
    return config;
  },
};

export default nextConfig;
