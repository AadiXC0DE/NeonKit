import { CursorGlow } from "@/components/ui/cursor-glow";

export default function CursorGlowDemo() {
  return (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#07080d] [--neon:var(--neon-accent,34_211_238)] [background-image:radial-gradient(rgb(255_255_255/0.09)_1px,transparent_1px)] [background-size:22px_22px]">
      <CursorGlow trail />
      <div className="relative px-6 py-20 text-center sm:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[rgb(var(--neon))]">Night shift</p>
        <h3 className="mx-auto mt-4 max-w-md text-balance text-3xl font-medium tracking-tight text-white/90 sm:text-4xl">
          Ship at 2am. Sleep anyway.
        </h3>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/55">
          Deploys roll back on their own when error rates climb, so the pager stays in the drawer.
        </p>
      </div>
    </div>
  );
}
