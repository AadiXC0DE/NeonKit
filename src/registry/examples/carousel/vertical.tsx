"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const steps = [
  { title: "Connect your repo", body: "Pick a GitHub org. We read the lockfile to find your framework and Node version." },
  { title: "Set environment variables", body: "Paste a .env file or pull from Vault. Secrets never show in build logs." },
  { title: "Choose regions", body: "Frankfurt and Virginia by default. Add Tokyo for under 60ms in APAC." },
  { title: "Ship the first deploy", body: "Every push to main goes live; every pull request gets its own preview URL." },
];

export default function CarouselVertical() {
  return (
    <Carousel aria-label="Setup steps" orientation="vertical" className="w-full max-w-md grid-cols-[1fr_auto] gap-5">
      <CarouselContent viewportClassName="h-44">
        {steps.map((step, i) => (
          <CarouselItem key={step.title} className="grid content-center gap-2">
            <p className="text-[13px] tabular-nums text-white/50">Step {i + 1} of {steps.length}</p>
            <h3 className="text-xl font-medium tracking-[-0.01em] text-white/90">{step.title}</h3>
            <p className="text-sm leading-6 text-white/55">{step.body}</p>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex flex-col items-center justify-center gap-2">
        <CarouselPrevious className="size-8" />
        <CarouselDots />
        <CarouselNext className="size-8" />
      </div>
    </Carousel>
  );
}
