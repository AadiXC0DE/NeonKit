"use client";

import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NeonSign } from "@/components/ui/neon-sign";
import { cn } from "@/lib/utils";
import { color } from "./config";
import { posts, type Post } from "./data";
import { useLights } from "./lights";
import { SectionHeading, display } from "./section-heading";

const stretched =
  "text-left outline-none after:absolute after:-inset-3 after:content-[''] focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-[rgb(var(--neon)/0.6)]";

function Meta({ post }: { post: Post }) {
  return (
    <p className="text-[14px] text-white/55">
      <time dateTime={post.date}>{post.dateLabel}</time>
      <span className="text-white/30"> / </span>
      {post.minutes} min read
    </p>
  );
}

function Featured({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const { on } = useLights();
  return (
    <article className="group/post relative">
      {/* The essay's subject, hung on the wall above it: one tube, one letter going */}
      <div className="relative grid h-[220px] place-items-center sm:h-[260px] lg:place-items-start">
        <div
          aria-hidden
          className={cn(
            "absolute left-1/2 top-1/2 h-[240px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.14),transparent)] transition-opacity duration-700 lg:left-[150px]",
            on ? "opacity-100" : "opacity-0",
          )}
        />
        <div aria-hidden className="relative lg:pt-8">
          <NeonSign
            on={on}
            color={color}
            lines={["focus"]}
            frame="pill"
            backplate={false}
            className="text-[clamp(44px,6vw,64px)]"
            flicker="dying"
            dyingLetter={3}
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          />
        </div>
      </div>
      <div className="mt-6">
        <Meta post={post} />
        <h3 className={cn(display, "mt-3 max-w-[18ch] text-[clamp(30px,3.4vw,44px)] leading-[1.04] text-white")}>
          <button type="button" aria-haspopup="dialog" onClick={onOpen} className={stretched}>
            {post.title}
          </button>
        </h3>
        <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-white/60">{post.excerpt}</p>
        <span
          aria-hidden
          className="mt-6 flex items-center gap-1 text-[14px] text-white/70 transition-colors group-hover/post:text-[rgb(var(--neon))]"
        >
          Read the opening <ArrowUpRight className="size-4" />
        </span>
      </div>
    </article>
  );
}

function Row({ post, onOpen }: { post: Post; onOpen: () => void }) {
  return (
    <li className="group/post relative border-t border-white/[0.08] py-8 last:border-b">
      {/* A short tube lights beside the one you're about to open */}
      <span
        aria-hidden
        className="absolute -left-5 top-9 h-10 w-px bg-[color-mix(in_srgb,rgb(var(--neon))_50%,white)] opacity-0 shadow-[0_0_6px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/0.5)] transition-opacity duration-200 group-focus-within/post:opacity-100 group-hover/post:opacity-100 sm:-left-8"
      />
      <Meta post={post} />
      <h3 className="mt-2.5 text-[clamp(21px,2vw,26px)] font-medium leading-snug tracking-[-0.02em] text-white/90 transition-colors duration-200 group-hover/post:text-white">
        <button type="button" aria-haspopup="dialog" onClick={onOpen} className={stretched}>
          {post.title}
        </button>
      </h3>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-white/55">{post.excerpt}</p>
    </li>
  );
}

export function Writing() {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [featured, ...rest] = posts;
  const post = posts[index];

  const read = (next: number) => {
    setIndex(next);
    setOpen(true);
  };

  return (
    <section id="writing" aria-labelledby="writing-title" className="scroll-mt-16">
      <div className="mx-auto max-w-[1200px] px-5 pb-28 pt-12 sm:px-10 sm:pb-40">
        <SectionHeading
          id="writing-title"
          title="Notes from the workbench."
          lede="Short essays on motion, light and the space between design and code. Roughly one a quarter, and the first few paragraphs are here."
        />

        <div className="mt-14 grid gap-14 sm:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Featured post={featured} onOpen={() => read(0)} />
          </div>
          <ol aria-label="More writing" className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            {rest.map((item, i) => (
              <Row key={item.slug} post={item} onOpen={() => read(i + 1)} />
            ))}
          </ol>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="p-6 sm:p-8">
          <DialogHeader>
            <Meta post={post} />
            <DialogTitle className={cn(display, "mt-2 text-[clamp(28px,3.6vw,38px)] leading-[1.04] text-white")}>
              {post.title}
            </DialogTitle>
            <DialogDescription className="text-[15px] text-white/60">{post.excerpt}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4 border-t border-white/[0.07] pt-6 text-[16px] leading-[1.7] text-white/80">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <DialogFooter className="items-center sm:justify-between">
            <p className="text-sm text-white/60">That&apos;s the opening. The rest goes out by email first.</p>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Back to the site
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
