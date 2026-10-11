import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { registry } from "@/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/docs", "/docs/installation", "/docs/theming", "/components"];
  return [
    ...pages.map((path) => ({ url: `${siteConfig.url}${path}` })),
    ...registry.map((item) => ({ url: `${siteConfig.url}/components/${item.slug}` })),
  ];
}
