import { DocsNav } from "@/components/site/docs-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-[88rem] px-4 sm:px-6">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto overscroll-contain pb-16 pr-6 pt-10 [mask-image:linear-gradient(to_bottom,#000_calc(100%-4rem),transparent)] md:block lg:w-60">
          <DocsNav />
        </aside>
        <main id="content" className="min-w-0 flex-1 pb-12 pt-12 sm:pt-16 md:pl-10 lg:pl-16">
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
