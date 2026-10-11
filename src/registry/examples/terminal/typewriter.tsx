import { Typewriter } from "@/components/ui/terminal";

export default function TerminalTypewriter() {
  return (
    <h2 className="max-w-xl text-center text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-tight tracking-[-0.02em] text-white/90">
      Neon UI for{" "}
      <Typewriter words={["dashboards", "landing pages", "late-night side projects"]} />
    </h2>
  );
}
