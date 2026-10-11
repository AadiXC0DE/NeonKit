import { cn } from "@/lib/utils";

export function SectionHeading({
  index,
  label,
  title,
  children,
  className,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 sm:mb-16", className)}>
      <div className="mb-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
        <span className="text-[rgb(var(--neon-accent))]">{index}</span>
        <span>{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <h2 className="text-balance text-[clamp(2.25rem,4.6vw,3.75rem)] font-semibold leading-[1] tracking-[-0.045em] text-fg">
          {title}
        </h2>
        {children && <div className="max-w-md text-[16px] leading-relaxed text-muted lg:justify-self-end">{children}</div>}
      </div>
    </div>
  );
}
