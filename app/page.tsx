import { Closing } from "@/components/landing/closing";
import { Directory } from "@/components/landing/directory";
import { Hero } from "@/components/landing/hero";
import { InstallFlow } from "@/components/landing/install-flow";
import { Principles } from "@/components/landing/principles";
import { Showcase } from "@/components/landing/showcase";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { registry } from "@/registry";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero componentCount={registry.length} />
        <Showcase />
        <InstallFlow />
        <Directory />
        <Principles />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
