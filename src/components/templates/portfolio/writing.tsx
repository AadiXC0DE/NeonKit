"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NeonSign } from "@/components/ui/neon-sign";
import { color } from "./config";
import { posts, type Post } from "./data";
import { useLights } from "./lights";
import { SectionHeading } from "./section-heading";

const stretched =
  "text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[rgb(var(--neon)/0.7)]";

function Meta({ post }: { post: Post }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
      <time dateTime={post.date}>{post.dateLabel}</time> · {post.minutes} min read
    </p>
  );
}

function Featured({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const { on } = useLights();
  return (
    <article className="group/post relative flex h-full flex-col overflow-hidden rounded-[20px] md:flex-row lg:flex-col border border-white/10 bg-white/[0.02] transition-colors duration-300 hover:border-white/20">
      <div className="relative grid h-[220px] shrink-0 place-items-center overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(ellipse_at_50%_45%,#101118,#07080d_70%)] sm:h-[260px] md:h-auto md:w-[46%] md:border-b-0 md:border-r lg:h-[260px] lg:w-auto lg:border-b lg:border-r-0">
        <div aria-hidden>
          <NeonSign
            on={on}
            color={color}
            lines={["focus"]}
            frame="pill"
            className="text-[clamp(38px,6vw,56px)]"
            flicker="dying"
            dyingLetter={3}
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <Meta post={post} />
        <h3 className="mt-4 text-[clamp(24px,2.6vw,30px)] font-medium leading-[1.12] tracking-[-0.03em] text-white">
          <button type="button" aria-haspopup="dialog" onClick={onOpen} className={`${stretched} after:rounded-[20px]`}>
            {post.title}
          </button>
        </h3>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-white/60">{post.excerpt}</p>
        <span
          aria-hidden
          className="mt-auto flex items-center gap-1 pt-6 text-sm text-white/70 transition-colors group-hover/post:text-[rgb(var(--neon))]"
        >
          Read the opening <ArrowUpRight className="size-4" />
        </span>
      </div>
    </article>
  );
}

function Row({ post, onOpen }: { post: Post; onOpen: () => void }) {
  return (
    <article className="group/post relative flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.03]">
      <span
        aria-hidden
        className="absolute inset-y-6 left-0 w-px bg-[rgb(var(--neon))] opacity-0 shadow-[0_0_8px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/0.5)] transition-opacity duration-300 group-hover/post:opacity-100"
      />
      <div>
        <Meta post={post} />
        <h3 className="mt-3 text-[20px] font-medium leading-snug tracking-[-0.02em] text-white">
          <button type="button" aria-haspopup="dialog" onClick={onOpen} className={`${stretched} after:rounded-2xl`}>
            {post.title}
          </button>
        </h3>
      </div>
      <p className="text-[15px] leading-relaxed text-white/60">{post.excerpt}</p>
    </article>
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
    <section id="writing" aria-labelledby="writing-title" className="scroll-mt-16 border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-10 sm:py-32">
        <SectionHeading
          index={4}
          eyebrow="Writing"
          id="writing-title"
          title="Notes from the workbench."
          note="Short essays on motion, light and the space between design and code. Roughly one a quarter."
        />

        <div className="mt-12 grid gap-5 sm:mt-16 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <Featured post={featured} onOpen={() => read(0)} />
          </div>
          <div className="grid gap-5 lg:col-span-6 lg:grid-rows-3 lg:gap-6">
            {rest.map((item, i) => (
              <Row key={item.slug} post={item} onOpen={() => read(i + 1)} />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="p-6 sm:p-8">
          <DialogHeader>
            <Meta post={post} />
            <DialogTitle className="mt-2 text-[clamp(24px,3.4vw,32px)] font-medium leading-[1.1] tracking-[-0.03em] text-white">
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
