import { DocsNav } from "@/components/site/docs-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex max-w-[88rem] px-4 sm:px-6">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 pr-4 md:block">
          <DocsNav />
        </aside>
        <main className="min-w-0 flex-1 py-10 md:border-l md:border-line md:pl-10 lg:pl-14">{children}</main>
      </div>
      <SiteFooter />
    </>
  );
}
