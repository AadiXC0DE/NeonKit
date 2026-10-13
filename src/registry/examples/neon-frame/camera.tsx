import { NeonFrame } from "@/components/ui/neon-frame";

export default function NeonFrameCamera() {
  return (
    <NeonFrame
      as="figure"
      label="Cam 03, loading dock"
      tabs={{
        topRight: (
          <>
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-[rgb(255_77_94)] shadow-[0_0_6px_rgb(255_77_94)]" />
            Rec
          </>
        ),
        bottomLeft: <span className="font-mono tabular-nums">2026-10-10 23:41:07</span>,
        bottomRight: "1080p · 24 fps",
      }}
      className="w-full max-w-xl p-2"
    >
      <div className="relative aspect-video overflow-hidden bg-[radial-gradient(120%_90%_at_60%_100%,#14202a,#07090d_70%)]">
        {/* Floor lines receding to the dock door */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 [mask-image:linear-gradient(to_top,#000,transparent)] [background-image:repeating-linear-gradient(90deg,rgb(255_255_255/0.05)_0_1px,transparent_1px_64px)]"
        />
        {/* Roller door */}
        <div
          aria-hidden
          className="absolute left-[18%] top-[22%] h-[46%] w-[34%] border border-white/[0.07] bg-[repeating-linear-gradient(180deg,rgb(255_255_255/0.035)_0_1px,transparent_1px_7px)]"
        />

        <NeonFrame
          color="amber"
          active
          bracket={8}
          tabs={{ bottomLeft: "Forklift 92%" }}
          className="absolute left-[54%] top-[38%] h-[38%] w-[30%] border-transparent bg-transparent p-0"
          aria-label="Detected: forklift, 92% confidence"
        />
      </div>
      <figcaption className="sr-only">Camera 3, loading dock, recording. One forklift detected.</figcaption>
    </NeonFrame>
  );
}
