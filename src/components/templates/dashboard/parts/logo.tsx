import { cn } from "@/lib/utils";

/** A switchback road drawn as one neon tube: a near-white core over a colored halo. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="rgb(var(--neon) / 0.07)" stroke="rgb(var(--neon) / 0.28)" />
      <path
        d="M9 8.5h11.5a3.75 3.75 0 0 1 0 7.5h-9a3.75 3.75 0 0 0 0 7.5H23"
        fill="none"
        stroke="rgb(var(--neon))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
        style={{ filter: "blur(2px)" }}
      />
      <path
        d="M9 8.5h11.5a3.75 3.75 0 0 1 0 7.5h-9a3.75 3.75 0 0 0 0 7.5H23"
        fill="none"
        stroke="rgb(var(--neon))"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5h11.5a3.75 3.75 0 0 1 0 7.5h-9a3.75 3.75 0 0 0 0 7.5H23"
        fill="none"
        stroke="rgb(255 255 255 / 0.85)"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
