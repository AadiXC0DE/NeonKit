"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const releases = [
  { version: "1.6", date: "Oct 9", title: "Data Table", body: "Sorting, filters, selection and pagination in one component. Fast at 1,000 rows." },
  { version: "1.5", date: "Sep 24", title: "Drawer", body: "Snap points, velocity-aware flicks and nested drawers that peek out from under each other." },
  { version: "1.4", date: "Sep 3", title: "Menubar", body: "The full APG keyboard model, hover switching and a filament that follows the open menu." },
  { version: "1.3", date: "Aug 14", title: "Tree View", body: "Typeahead, lazy folders and a lit guide down the branch you're in." },
  { version: "1.2", date: "Jul 22", title: "Glow Chart", body: "Lines that read like tubes, with a crosshair that lights the values it crosses." },
  { version: "1.1", date: "Jun 30", title: "Command", body: "Fuzzy search with ranked groups, nested pages and recent items." },
];

export default function CarouselDemo() {
  return (
    <Carousel aria-label="Recent releases" className="w-full max-w-4xl gap-5 sm:[--slides:2] lg:[--slides:3]">
      <CarouselContent>
        {releases.map((release) => (
          <CarouselItem key={release.version}>
            <article className="grid h-full content-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <p className="flex items-baseline justify-between text-[13px] text-white/50">
                <span className="font-mono text-white/70">v{release.version}</span>
                {release.date}
              </p>
              <h3 className="text-lg font-medium tracking-[-0.01em] text-white/90">{release.title}</h3>
              <p className="text-sm leading-6 text-white/55">{release.body}</p>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center justify-between gap-4">
        <CarouselDots />
        <div className="flex gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
    </Carousel>
  );
}
