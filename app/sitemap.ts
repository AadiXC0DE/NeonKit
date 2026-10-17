import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { blocks, registry, templates } from "@/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number][] = [
    ["", 1],
    ["/components", 0.9],
    ...(blocks.length ? ([["/blocks", 0.9]] as [string, number][]) : []),
    ...(templates.length ? ([["/templates", 0.9]] as [string, number][]) : []),
    ["/docs", 0.8],
    ["/docs/installation", 0.8],
    ["/docs/theming", 0.7],
    ["/theme", 0.8],
    ["/docs/ai", 0.7],
    ["/changelog", 0.6],
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
    ...blocks.map((block) => ({
      url: `${siteConfig.url}/blocks/${block.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...templates.map((template) => ({
      url: `${siteConfig.url}/templates/${template.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
