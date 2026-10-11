import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { registry } from "@/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number][] = [
    ["", 1],
    ["/components", 0.9],
    ["/docs", 0.8],
    ["/docs/installation", 0.8],
    ["/docs/theming", 0.7],
    ["/docs/ai", 0.7],
    ["/request", 0.5],
    ["/sponsor", 0.4],
  ];
  return [
    ...pages.map(([path, priority]) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...registry.map((item) => ({
      url: `${siteConfig.url}/components/${item.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
