"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselPlayToggle,
} from "@/components/ui/carousel";

const quotes = [
  {
    quote: "We replaced four internal table wrappers with one component and deleted 3,100 lines.",
    name: "Hana Okafor",
    role: "Staff engineer, Ledgerline",
  },
  {
    quote: "Our on-call dashboard finally reads at 3am. The live dots tell you what's moving without shouting.",
    name: "Tomás Reyes",
    role: "SRE lead, Pelican Air",
  },
  {
    quote: "Designers stopped filing tickets about focus rings. That has never happened before.",
    name: "Ines Lindqvist",
    role: "Design systems, Coral",
  },
];

export default function CarouselAutoplay() {
  return (
    <Carousel aria-label="What teams say" autoplay={6000} loop className="w-full max-w-xl gap-6">
      <CarouselContent>
        {quotes.map((q) => (
          <CarouselItem key={q.name}>
            <figure className="grid gap-5 px-1">
              <blockquote className="text-xl leading-8 tracking-[-0.01em] text-white/90 sm:text-2xl sm:leading-9">
                “{q.quote}”
              </blockquote>
              <figcaption className="text-sm text-white/55">
                <span className="text-white/80">{q.name}</span> · {q.role}
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center gap-3">
        <CarouselPlayToggle className="size-8" />
        <CarouselDots />
      </div>
    </Carousel>
  );
}
