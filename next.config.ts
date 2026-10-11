import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/components/:slug.md", destination: "/md/:slug" }];
  },
  async redirects() {
    return [
      { source: "/setup", destination: "/docs/installation", permanent: true },
      { source: "/components/dropdown", destination: "/components/select", permanent: true },
      { source: "/components/modal", destination: "/components/dialog", permanent: true },
      { source: "/components/inputs", destination: "/components/input", permanent: true },
      { source: "/components/radio", destination: "/components/radio-group", permanent: true },
    ];
  },
};

export default nextConfig;
