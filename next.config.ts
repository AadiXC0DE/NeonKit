import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/components/:slug.md", destination: "/md/:slug" }];
  },
  async redirects() {
    return [
      // The old Vercel hostname keeps working, registry URLs included: shadcn follows redirects.
      {
        source: "/:path*",
        has: [{ type: "host", value: "get-neonkit.vercel.app" }],
        destination: "https://neonkit.heyaadi.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.neonkit.heyaadi.com" }],
        destination: "https://neonkit.heyaadi.com/:path*",
        permanent: true,
      },
      { source: "/setup", destination: "/docs/installation", permanent: true },
      { source: "/components/dropdown", destination: "/components/select", permanent: true },
      { source: "/components/modal", destination: "/components/dialog", permanent: true },
      { source: "/components/inputs", destination: "/components/input", permanent: true },
      { source: "/components/radio", destination: "/components/radio-group", permanent: true },
    ];
  },
};

export default nextConfig;
