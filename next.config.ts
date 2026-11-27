import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/v1/assets/[id]": ["./src/content/photos/**/*"],
  },
  turbopack: {},
  webpack: (config, { dev }) => {
    if (!dev) return config;
    config.watchOptions = {
      ...config.watchOptions,
      // Catalog writes must not rebuild the open page. Webpack only accepts a glob or regexp here.
      ignored: /[\\/](?:node_modules|\.git|\.next)[\\/]|[\\/]src[\\/]content[\\/]fish-catalog\.json$|[\\/]src[\\/]content[\\/]photos[\\/]/,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
