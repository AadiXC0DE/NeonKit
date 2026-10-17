/* eslint-disable @next/next/no-img-element -- examples are pasted into any React app, not only Next.js */
import { ImageCompare } from "@/components/ui/image-compare";

const photo =
  "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1600&q=80";

// The raw file is the same photo, flattened the way a log profile records it.
export default function ImageCompareDemo() {
  return (
    <ImageCompare
      className="aspect-[3/2] w-full max-w-[760px]"
      defaultValue={42}
      beforeLabel="Raw"
      afterLabel="Graded"
      before={<img src={photo} alt="" className="[filter:saturate(0.32)_contrast(0.74)_brightness(0.9)_sepia(0.08)]" />}
      after={<img src={photo} alt="Shibuya crossing at night, colour graded" />}
    />
  );
}
