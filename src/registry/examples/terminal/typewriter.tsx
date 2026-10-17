import { Typewriter } from "@/components/ui/terminal";

export default function TerminalTypewriter() {
  return (
    // The rotating words get a line of their own, so the headline never reflows while they type.
    <h2 className="max-w-xl text-center text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-tight tracking-[-0.02em] text-white/90">
      Neon UI for
      <br />
      <Typewriter className="inline-block min-h-[1.25em] whitespace-nowrap" words={["dashboards", "landing pages", "2am side projects"]} />
    </h2>
  );
}
