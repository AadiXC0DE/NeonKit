import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NeonText } from "@/components/ui/neon-text";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { textLink } from "@/components/site/prose";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="relative isolate overflow-x-clip pb-32 pt-24 sm:pt-32">
        {/* The red the sign throws on the wall */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[30%] -z-10 h-[40%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(255_92_122/0.08)] blur-[120px]"
        />
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
          <div className="flex justify-center">
            <div aria-hidden className="rounded-[28px] border border-white/[0.05] px-6 pb-3 pt-1.5 sm:px-14 sm:pb-6 sm:pt-3">
              <NeonText as="p" color="red" buzz className="whitespace-nowrap font-neon text-[clamp(2.75rem,12vw,8.5rem)] leading-[1.1]">
                No Vacancy
              </NeonText>
            </div>
          </div>

          <div className="mt-20 grid gap-8 sm:mt-24 lg:grid-cols-12 lg:items-end lg:gap-6">
            <h1 className="type-display text-balance text-[clamp(2rem,3.4vw,3.25rem)] text-fg lg:col-span-6">
              Nothing at this address.
            </h1>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="max-w-[30rem] text-[16.5px] leading-[1.6] text-muted">
                The link may be old, or the page moved when the library grew. Try the search up top, or start from
                one of these.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button asChild variant="solid" size="lg">
                  <Link href="/components">Browse components</Link>
                </Button>
                <Link href="/" className={textLink}>
                  Back to the front
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
