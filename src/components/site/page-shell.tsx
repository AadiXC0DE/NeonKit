import { cn } from "@/lib/utils";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Header, the page column and the footer: used by the pages outside the docs. */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      <SiteHeader />
      <main id="content" className={cn("mx-auto max-w-[88rem] px-4 pb-32 pt-16 sm:px-6 sm:pt-24", className)}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
