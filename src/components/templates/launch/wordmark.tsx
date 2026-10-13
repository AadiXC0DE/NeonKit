import { cn } from "@/lib/utils";

/** A sun sitting on the horizon: the only lit part of the mark is what's left above the line. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={cn("size-6 overflow-visible", className)}>
      <path d="M5 15a7 7 0 0 1 14 0" stroke="rgb(var(--neon) / 0.22)" strokeWidth={2.4} strokeLinecap="round" />
      <path
        d="M8.2 15a3.8 3.8 0 0 1 7.6 0"
        stroke="color-mix(in srgb, rgb(var(--neon)) 35%, white)"
        strokeWidth={1.8}
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 2px rgb(var(--neon))) drop-shadow(0 0 6px rgb(var(--neon) / 0.7))" }}
      />
      <path d="M2.5 18.5h19" stroke="rgb(255 255 255 / 0.55)" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 text-[17px] font-semibold lowercase tracking-[-0.035em] text-white/90", className)}>
      <Mark />
      <span>
        low light<span className="ml-1 font-mono text-[11px] font-normal tracking-normal text-white/55">&apos;27</span>
      </span>
    </span>
  );
}
