import type { Metadata } from "next";
import { Anatomy } from "@/components/landing/anatomy";
import { Closing } from "@/components/landing/closing";
import { Hero } from "@/components/landing/hero";
import { Install } from "@/components/landing/install";
import { Lights } from "@/components/landing/lights";
import { Rack } from "@/components/landing/rack";
import { shelfPicks, type Reel } from "@/components/landing/shelf-data";
import { Shelves } from "@/components/landing/shelves";
import "@/components/landing/landing.css";
import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteConfig } from "@/config/site";
import { blocks, categories, currentVersion, getBlock, registry, templatePreviewPath, templates } from "@/registry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const author = {
  "@type": "Person",
  name: siteConfig.author.name,
  url: siteConfig.author.site,
  sameAs: [siteConfig.author.x, siteConfig.author.github],
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NeonKit",
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    author,
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "NeonKit",
    description: siteConfig.description,
    url: siteConfig.url,
    codeRepository: siteConfig.github,
    programmingLanguage: ["TypeScript", "React", "Tailwind CSS"],
    runtimePlatform: "Web",
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    keywords: siteConfig.keywords.join(", "),
    author,
    hasPart: registry.map((item) => ({
      "@type": "SoftwareSourceCode",
      name: `${item.name} component`,
      description: item.description,
      url: `${siteConfig.url}/components/${item.slug}`,
    })).concat(
      blocks.map((block) => ({
        "@type": "SoftwareSourceCode",
        name: `${block.name} block`,
        description: block.description,
        url: `${siteConfig.url}/blocks/${block.slug}`,
      })),
    ),
  },
];

const lookup = Object.fromEntries(
  registry.map(({ slug, name, description, category }) => [slug, { slug, name, description, category }]),
);
const shelves = categories
  .filter((category) => shelfPicks[category])
  .map((category) => ({ category, count: registry.filter((item) => item.category === category).length }));

// Templates and blocks, alternating, strongest first.
const reelBlocks = ["hero-sign", "pricing-tiers", "app-dashboard", "features-bento", "hero-city"];
const reels: Reel[] = templates.flatMap((template, i) => {
  const block = getBlock(reelBlocks[i] ?? "");
  return [
    { href: `/templates/${template.slug}`, src: templatePreviewPath(template.slug), name: template.name, meta: "Template" },
    ...(block ? [{ href: `/blocks/${block.slug}`, src: `/view/${block.slug}`, name: block.name, meta: block.category }] : []),
  ];
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main id="content">
        <Hero
          componentCount={registry.length}
          blockCount={blocks.length}
          templateCount={templates.length}
          version={currentVersion}
        />
        <Lights />
        <Rack instrumentCount={registry.filter((item) => item.category === "Instruments").length} />
        <Anatomy />
        <Shelves
          total={registry.length}
          shelves={shelves}
          lookup={lookup}
          reels={reels}
          blockCount={blocks.length}
          templateCount={templates.length}
        />
        <Install />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
