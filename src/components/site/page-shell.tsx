import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Header, a centered column and the footer: used by the non-docs pages. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[88rem] px-4 pb-24 pt-16 sm:px-6 sm:pt-20">{children}</main>
      <SiteFooter />
    </>
  );
}
