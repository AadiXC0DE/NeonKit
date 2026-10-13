import type { Metadata } from "next";
import { BlocksStrip } from "@/components/landing/blocks-strip";
import { Closing } from "@/components/landing/closing";
import { Directory } from "@/components/landing/directory";
import { Hero } from "@/components/landing/hero";
import { InstallFlow } from "@/components/landing/install-flow";
import { Principles } from "@/components/landing/principles";
import { Showcase } from "@/components/landing/showcase";
import { JsonLd } from "@/components/site/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { siteConfig } from "@/config/site";
import { blocks, registry } from "@/registry";

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

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main>
        <Hero componentCount={registry.length} blockCount={blocks.length} />
        <Showcase />
        <InstallFlow />
        <Directory />
        <BlocksStrip />
        <Principles />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
