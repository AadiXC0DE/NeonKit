import Link from "next/link";
import { GlitchText } from "@/components/ui/glitch-text";

export default function GlitchTextNotFound() {
  return (
    <div className="flex max-w-sm flex-col items-center gap-5 text-center">
      <GlitchText as="h2" trigger="inView" intensity="heavy" color="amber" className="font-mono text-7xl font-medium tabular-nums tracking-tight text-white/90">
        404
      </GlitchText>
      <p className="text-sm leading-6 text-white/55">
        This page dropped out of the signal. It may have moved, or it never existed.
      </p>
      <Link
        href="/"
        className="rounded-md text-sm font-medium text-[rgb(251_191_36)] underline decoration-[rgb(251_191_36/0.35)] underline-offset-4 outline-none transition-colors hover:decoration-[rgb(251_191_36)] focus-visible:ring-2 focus-visible:ring-[rgb(251_191_36/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
      >
        Back to the homepage
      </Link>
    </div>
  );
}
