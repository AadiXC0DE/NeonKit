/* eslint-disable @next/next/no-img-element -- examples are pasted into any React app, not only Next.js */
import { ImageCompare } from "@/components/ui/image-compare";

const photo =
  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80";

/** The handheld frame: underexposed with sensor noise laid over it. */
function Handheld() {
  return (
    <div className="relative h-full w-full">
      <img src={photo} alt="" className="block h-full w-full object-cover [filter:brightness(0.42)_saturate(0.7)_contrast(0.9)]" />
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.55] mix-blend-screen">
        <filter id="image-compare-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.6  0 0 0 0 0.7  0 0 0 1.4 -0.55" />
        </filter>
        <rect width="100%" height="100%" filter="url(#image-compare-grain)" />
      </svg>
    </div>
  );
}

export default function ImageCompareVertical() {
  return (
    <ImageCompare
      orientation="vertical"
      className="aspect-[4/5] w-full max-w-[420px]"
      defaultValue={46}
      beforeLabel="Handheld, ISO 6400"
      afterLabel="Night mode"
      before={<Handheld />}
      after={<img src={photo} alt="Shinjuku street signs at night" />}
    />
  );
}
