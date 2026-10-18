"use client";

import * as React from "react";
import { Banner, BannerAction } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

const nav = ["Product", "Docs", "Pricing", "Changelog"];

export default function BannerDemo() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="w-full max-w-[880px]">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#05060a]">
        <Banner
          variant="launch"
          tag="New"
          open={open}
          onOpenChange={setOpen}
          dismissible
          action={
            <BannerAction asChild>
              <a href="#release-notes">Release notes</a>
            </BannerAction>
          }
        >
          Halcyon 2.0: branch databases, preview deploys and a CLI that starts in 90 ms.
        </Banner>
        <div className="flex items-center justify-between gap-6 border-b border-white/[0.06] px-5 py-3.5">
          <span className="text-[15px] font-semibold text-white/90">Halcyon</span>
          <nav aria-label="Site" className="hidden gap-6 text-[14px] text-white/60 sm:flex">
            {nav.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white/90">
                {item}
              </a>
            ))}
          </nav>
          <Button size="sm" variant="ghost">
            Sign in
          </Button>
        </div>
        <div className="px-5 pb-12 pt-10 sm:px-10">
          <p className="max-w-[18ch] text-[clamp(28px,5vw,44px)] font-semibold leading-[1.02] tracking-[-0.03em] text-white/90">
            Postgres that branches with your code.
          </p>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-6 text-white/55">
            Every pull request gets its own database, seeded from production and gone when you merge.
          </p>
        </div>
      </div>
      <div className="mt-4 flex h-8 items-center justify-center">
        {!open && (
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            Show the banner again
          </Button>
        )}
      </div>
    </div>
  );
}
