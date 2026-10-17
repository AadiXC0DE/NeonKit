import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** An underlined text link that lights its underline on hover, as on the landing page. */
export const textLink =
  "text-fg underline decoration-white/25 decoration-1 underline-offset-[0.22em] transition-[text-decoration-color] duration-200 hover:decoration-[rgb(var(--neon-accent))]";

export function PageHeader({
  title,
  meta,
  children,
  action,
  size = "md",
  className,
}: {
  title: React.ReactNode;
  /** One line of small text above the title: a breadcrumb or a count. Sentence case. */
  meta?: React.ReactNode;
  children?: React.ReactNode;
  /** Something to sit on the title's baseline at the right, like a copy button. */
  action?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <header className={cn("mb-14 grid grid-cols-1 sm:mb-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-8", className)}>
      {meta && <div className="mb-5 text-[13.5px] text-muted lg:col-span-2">{meta}</div>}
      <h1
        className={cn(
          "type-display text-balance text-fg",
          size === "lg" ? "text-[clamp(2.9rem,6.4vw,5.5rem)]" : "text-[clamp(2.6rem,5vw,4.25rem)]",
        )}
      >
        {title}
      </h1>
      {/* Beside the title on wide screens; under the description otherwise. */}
      {action && <div className="order-last mt-7 lg:order-none lg:mt-0 lg:self-end">{action}</div>}
      {children && (
        <div className="mt-6 max-w-[40rem] text-pretty text-[17.5px] leading-[1.6] text-muted lg:col-span-2 [&_a]:text-fg">
          {children}
        </div>
      )}
    </header>
  );
}

/** Small "Parent / Here" trail above a title. */
export function Trail({ items }: { items: { title: React.ReactNode; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 text-[13.5px] text-muted">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-white/20">
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="rounded transition-colors hover:text-fg">
                {item.title}
              </Link>
            ) : (
              <span className="text-fg/90">{item.title}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function H2({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      className={cn(
        "group mb-6 mt-24 scroll-mt-24 text-[1.75rem] text-fg type-display first:mt-0 sm:text-[2rem]",
        className,
      )}
    >
      <a href={`#${id}`} className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)]">
        {children}
      </a>
    </h2>
  );
}

export function H3({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <h3
      id={id}
      className={cn(
        "mb-2 mt-14 scroll-mt-24 text-[1.125rem] font-medium leading-snug tracking-[-0.015em] text-fg",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-5 max-w-[40rem] text-pretty text-[16px] leading-[1.7] text-muted",
        "[&_a]:text-fg [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-[0.22em] [&_a]:transition-[text-decoration-color] hover:[&_a]:decoration-[rgb(var(--neon-accent))]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-white/[0.06] px-[0.35em] py-[0.12em] font-mono text-[0.84em] text-fg [overflow-wrap:anywhere]">
      {children}
    </code>
  );
}

/** A note in the margin of the prose. Plain text with a rule, not a coloured box. */
export function Callout({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <aside
      className={cn(
        "my-8 max-w-[40rem] border-l border-white/15 pl-5 text-[15px] leading-[1.65] text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-[0.22em]",
        className,
      )}
    >
      {title && <p className="mb-1 font-medium text-fg">{title}</p>}
      {children}
    </aside>
  );
}

export function Steps({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ol className={cn("relative space-y-12 [counter-reset:step]", className)}>{children}</ol>;
}

export function Step({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        "relative pl-10 [counter-increment:step] sm:pl-12",
        // The numeral hangs in the gutter; a hairline runs down to the next step.
        "before:absolute before:left-0 before:top-0 before:text-[15px] before:font-medium before:leading-[1.6] before:tabular-nums before:text-fg before:content-[counter(step)]",
        "after:absolute after:-bottom-9 after:left-[4px] after:top-9 after:w-px after:bg-white/[0.08] last:after:hidden",
      )}
    >
      <h3 className="mb-3 text-[15px] font-medium leading-[1.6] text-fg">{title}</h3>
      <div className="min-w-0 space-y-4 text-[15px] leading-[1.65] text-muted">{children}</div>
    </li>
  );
}

export function PagerLinks({
  prev,
  next,
  className,
}: {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
  className?: string;
}) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next" className={cn("mt-28 grid grid-cols-2 gap-6 border-t border-line pt-8", className)}>
      {prev ? (
        <Link href={prev.href} className="group min-w-0 rounded-lg outline-offset-4">
          <span className="flex items-center gap-1.5 text-[13.5px] text-muted transition-colors group-hover:text-fg">
            <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" /> Previous
          </span>
          <span className="type-display mt-2 block truncate text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.1] text-fg">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="group min-w-0 rounded-lg text-right outline-offset-4">
          <span className="flex items-center justify-end gap-1.5 text-[13.5px] text-muted transition-colors group-hover:text-fg">
            Next <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
          <span className="type-display mt-2 block truncate text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.1] text-fg">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

/** "A, B and C" with any nodes, for sentences that list links. */
export function series(nodes: React.ReactNode[]) {
  return nodes.map((node, i) => (
    <span key={i}>
      {i > 0 && (i === nodes.length - 1 ? " and " : ", ")}
      {node}
    </span>
  ));
}
