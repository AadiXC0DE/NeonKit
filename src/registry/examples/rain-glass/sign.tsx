import { NeonText } from "@/components/ui/neon-text";
import { RainGlass } from "@/components/ui/rain-glass";

export default function RainGlassSign() {
  return (
    <div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgb(240_70_235/0.12),transparent_70%),#05060a]">
      <NeonText as="p" color="magenta" buzz className="text-6xl tracking-wide [filter:blur(1.5px)]" style={{ fontFamily: "var(--font-tilt-neon)" }}>
        open
      </NeonText>
      <RainGlass bokeh={false} intensity={0.6} color="magenta" />
    </div>
  );
}
