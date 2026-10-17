"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselProgress,
} from "@/components/ui/carousel";
import { NeonSign } from "@/components/ui/neon-sign";

const signs = [
  { text: "OPEN", place: "Bar Alfama, Lisbon", time: "01:12", color: "orange" },
  { text: "RAMEN", place: "Shibuya, Tokyo", time: "22:40", color: "pink" },
  { text: "24H", place: "Laundromat, Reykjavík", time: "03:58", color: "cyan" },
  { text: "TACOS", place: "Roma Norte, Mexico City", time: "19:44", color: "lime" },
  { text: "HOTEL", place: "Mong Kok, Hong Kong", time: "02:17", color: "red" },
  { text: "VINYL", place: "Bjørvika, Oslo", time: "20:31", color: "violet" },
  { text: "BAR", place: "Kreuzberg, Berlin", time: "00:05", color: "amber" },
];

// Drag with the mouse, swipe on touch; the tube under the strip follows the scroll.
export default function CarouselGallery() {
  return (
    <Carousel aria-label="Signs from night walks" className="w-full max-w-4xl gap-4 [--gap:12px] [--slides:1.2] sm:[--slides:2.4]">
      <CarouselContent>
        {signs.map((sign) => (
          <CarouselItem key={sign.place}>
            <figure className="grid aspect-[4/3] grid-rows-[1fr_auto] overflow-hidden rounded-xl border border-white/10 bg-[#07080c]">
              <div className="grid place-items-center">
                <NeonSign color={sign.color} size="sm" flicker="clean">
                  {sign.text}
                </NeonSign>
              </div>
              <figcaption className="flex items-baseline justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
                <span className="truncate text-sm text-white/80">{sign.place}</span>
                <span className="font-mono text-xs text-white/50">{sign.time}</span>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center gap-4">
        <CarouselProgress className="flex-1" />
        <CarouselPrevious className="size-8" />
        <CarouselNext className="size-8" />
      </div>
    </Carousel>
  );
}
