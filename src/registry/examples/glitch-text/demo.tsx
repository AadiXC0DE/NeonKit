import { GlitchText } from "@/components/ui/glitch-text";

export default function GlitchTextDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <GlitchText as="h2" intensity="heavy" className="text-[clamp(2.75rem,10vw,5.5rem)] font-semibold leading-none tracking-[-0.03em] text-white/90">
        SIGNAL LOST
      </GlitchText>
      <p className="text-sm text-white/55">
        Relay 07 dropped out. Retrying in <span className="font-mono tabular-nums text-white/80">00:30</span>
      </p>
    </div>
  );
}
