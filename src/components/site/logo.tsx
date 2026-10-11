import { cn } from "@/lib/utils";

/** The NeonKit mark: a tube-bent N in a square frame, lit by --neon-accent. */
export function LogoMark({ className, off = false }: { className?: string; off?: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn(
        "size-6 shrink-0 overflow-visible transition-[filter,opacity] duration-300",
        off
          ? "opacity-40"
          : "[filter:drop-shadow(0_0_2px_rgb(var(--neon-accent)))_drop-shadow(0_0_6px_rgb(var(--neon-accent)/0.7))]",
        className,
      )}
    >
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="26" height="26" rx="4.5" stroke="rgb(var(--neon-accent))" strokeWidth="2.6" />
        <path d="M11 22V10l10 12V10" stroke="rgb(var(--neon-accent))" strokeWidth="2.6" />
        {!off && (
          <>
            <rect x="3" y="3" width="26" height="26" rx="4.5" stroke="white" strokeOpacity="0.85" strokeWidth="0.9" />
            <path d="M11 22V10l10 12V10" stroke="white" strokeOpacity="0.85" strokeWidth="0.9" />
          </>
        )}
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em] text-fg">NeonKit</span>
    </span>
  );
}
