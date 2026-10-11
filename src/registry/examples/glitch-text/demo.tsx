import { GlitchText } from "@/components/ui/glitch-text";

export default function GlitchTextDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <GlitchText as="h2" intensity="heavy" className="text-[clamp(2.75rem,10vw,5.5rem)] font-semibold leading-none tracking-[-0.03em] text-white/90">
        SIGNAL LOST
      </GlitchText>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
        Relay 07 · retrying in 30s
      </p>
    </div>
  );
}
