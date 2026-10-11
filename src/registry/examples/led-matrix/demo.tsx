import { LedMatrix } from "@/components/ui/led-matrix";

const calling = "CALLING AT SHINJUKU · NOBORITO · MACHIDA · SAGAMI-ONO · HON-ATSUGI · ODAWARA.  ALL 10 CARS.";

export default function LedMatrixDemo() {
  return (
    <div className="relative w-full max-w-2xl [--neon:var(--neon-accent,34_211_238)]">
      {/* The sign lights the wall around it */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-10 inset-x-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,rgb(var(--neon)/0.14),transparent_70%)]"
      />
      <div className="relative rounded-xl border border-white/10 bg-[linear-gradient(to_bottom,#15171d,#0b0c10)] p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.06)]">
        <div className="flex items-center justify-between gap-4 px-2 pb-2 pt-1 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
          <span>Platform 4</span>
          <span className="truncate">Southbound</span>
        </div>
        <div className="grid gap-1.5">
          {/* Too wide to hold still on a narrow screen, so there it scrolls too */}
          <LedMatrix text="23:14  EXPRESS  ODAWARA" speed={0} dotSize={3} gap={1.5} className="rounded-md max-lg:hidden" />
          <LedMatrix text="23:14  EXPRESS  ODAWARA" speed={40} dotSize={3} gap={1.5} className="rounded-md lg:hidden" />
          <LedMatrix text={calling} speed={64} dotSize={3} gap={1.5} className="rounded-md" />
        </div>
      </div>
    </div>
  );
}
