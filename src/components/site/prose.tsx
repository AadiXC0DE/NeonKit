import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-10">
      {eyebrow && <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">{eyebrow}</p>}
      <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-fg">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{children}</div>}
    </header>
  );
}

export function H2({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      className={cn(
        "group mb-5 mt-16 scroll-mt-24 text-[1.375rem] font-semibold tracking-[-0.025em] text-fg first:mt-0",
        className,
      )}
    >
      <a href={`#${id}`} className="outline-none">
        {children}
        <span className="ml-2 text-dim opacity-0 transition-opacity group-hover:opacity-100">#</span>
      </a>
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mb-2 mt-10 scroll-mt-24 text-[1.0625rem] font-semibold tracking-[-0.015em] text-fg">
      {children}
    </h3>
  );
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mb-4 max-w-2xl leading-[1.75] text-muted [&_a]:text-fg [&_a]:underline [&_a]:decoration-white/20 [&_a]:underline-offset-4 hover:[&_a]:decoration-[rgb(var(--neon-accent))]", className)}>{children}</p>;
}

export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[5px] border border-line bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
      {children}
    </code>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="relative space-y-10 border-l border-line pl-8 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="relative [counter-increment:step] before:absolute before:-left-[45px] before:top-0 before:grid before:size-[26px] before:place-items-center before:rounded-full before:border before:border-line-strong before:bg-background before:font-mono before:text-[11px] before:text-muted before:content-[counter(step)]">
      <h3 className="mb-3 text-[15px] font-semibold text-fg">{title}</h3>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </li>
  );
}

export function PagerLinks({
  prev,
  next,
}: {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}) {
  return (
    <div className="mt-20 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="group rounded-xl border border-line p-4 transition-colors hover:border-line-strong">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" /> Previous
          </span>
          <span className="mt-1.5 block text-fg">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="group rounded-xl border border-line p-4 text-right transition-colors hover:border-line-strong">
          <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            Next <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
          <span className="mt-1.5 block text-fg">{next.title}</span>
        </Link>
      )}
    </div>
  );
}
