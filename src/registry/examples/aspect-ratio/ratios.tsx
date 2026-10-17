import { AspectRatio } from "@/components/ui/aspect-ratio";

const shapes = [
  { ratio: "1:1", use: "Avatar, app icon", width: "w-[22%]" },
  { ratio: "4:5", use: "Instagram post", width: "w-[20%]" },
  { ratio: "16:9", use: "Video, OG image", width: "w-[34%]" },
  { ratio: "9:16", use: "Story, Reel", width: "w-[13%]" },
];

export default function AspectRatioRatios() {
  return (
    <div className="flex w-full max-w-3xl items-end gap-[3%]">
      {shapes.map((shape) => (
        <figure key={shape.ratio} className={`${shape.width} shrink-0`}>
          <AspectRatio
            ratio={shape.ratio}
            className="rounded-lg border border-white/10 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.035)_0_1px,transparent_1px_7px)]"
          >
            <span className="absolute inset-0 grid place-items-center font-mono text-[12px] tabular-nums text-white/70">
              {shape.ratio}
            </span>
          </AspectRatio>
          <figcaption className="mt-2 text-[12.5px] leading-snug text-white/50">{shape.use}</figcaption>
        </figure>
      ))}
    </div>
  );
}
