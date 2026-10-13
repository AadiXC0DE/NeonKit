// The building blocks every docs page is written with. They're plain components today;
// when you move to MDX, return `mdxComponents` from mdx-components.tsx and these become
// the elements your Markdown renders to (headings need ids, e.g. from rehype-slug).

import * as React from "react";
import Link from "next/link";
import { ArrowRight, FileCode2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import { Kbd, KbdCombo } from "@/components/ui/kbd";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { color } from "./config";
import { CodeTabs, PackageTabs, Pre, TabChoiceProvider } from "./code";
import { copyText, type Lang } from "./highlight";
import { codeFrame, focusRing } from "./styles";

/* Text ------------------------------------------------------------------------------------------ */

function H2({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      className={cn(
        "group mt-16 scroll-mt-24 outline-none text-[1.45rem] font-semibold leading-tight tracking-[-0.025em] text-white",
        className,
      )}
    >
      <HeadingAnchor id={id}>{children}</HeadingAnchor>
    </h2>
  );
}

function H3({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  return (
    <h3
      id={id}
      tabIndex={-1}
      className={cn("group mt-10 scroll-mt-24 outline-none text-[1.05rem] font-semibold tracking-[-0.01em] text-white", className)}
    >
      <HeadingAnchor id={id}>{children}</HeadingAnchor>
    </h3>
  );
}

function HeadingAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a href={`#${id}`} className={cn("rounded-md", focusRing)}>
      {children}
      <span
        aria-hidden
        className="ml-2 font-mono text-[0.8em] font-normal text-[rgb(var(--neon))] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
      >
        #
      </span>
    </a>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-5 text-[15px] leading-7 text-white/70", className)}>{children}</p>;
}

function UL({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul
      className={cn(
        "mt-5 list-disc space-y-2.5 pl-5 text-[15px] leading-7 text-white/70",
        "[&>li::marker]:text-[rgb(var(--neon)/0.7)] [&>li]:pl-1.5",
        className,
      )}
    >
      {children}
    </ul>
  );
}

function OL({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ol
      className={cn(
        "mt-5 list-decimal space-y-2.5 pl-5 text-[15px] leading-7 text-white/70",
        "[&>li::marker]:font-mono [&>li::marker]:text-[13px] [&>li::marker]:text-white/60 [&>li]:pl-1.5",
        className,
      )}
    >
      {children}
    </ol>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const className = cn(
    "rounded-md font-medium text-white underline decoration-[rgb(var(--neon)/0.55)] decoration-1 underline-offset-[5px]",
    "transition-[color,text-decoration-color] duration-150 hover:text-[rgb(var(--neon))] hover:decoration-[rgb(var(--neon))]",
    focusRing,
  );
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-white/[0.08] bg-white/[0.05] px-[0.35em] py-[0.1em] font-mono text-[0.86em] text-white/90 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
      {children}
    </code>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-white/90">{children}</strong>;
}

/* Callout --------------------------------------------------------------------------------------- */

const callouts = {
  note: { status: "info", title: "Note" },
  tip: { status: "success", title: "Tip" },
  warning: { status: "warning", title: "Warning" },
  danger: { status: "error", title: "Danger" },
} as const;

type CalloutProps = {
  type?: keyof typeof callouts;
  title?: React.ReactNode;
  children: React.ReactNode;
};

function Callout({ type = "note", title, children }: CalloutProps) {
  const { status, title: fallback } = callouts[type];
  return (
    <Alert
      role="note"
      status={status}
      // Notes and tips wear the brand color; warnings and dangers keep their amber and red.
      color={type === "note" || type === "tip" ? color : undefined}
      className="mt-7 rounded-xl"
    >
      <AlertTitle>{title ?? fallback}</AlertTitle>
      <AlertDescription className="leading-6 text-white/70 [&_p+p]:mt-2">{children}</AlertDescription>
    </Alert>
  );
}

/* Steps ----------------------------------------------------------------------------------------- */

function Steps({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <ol className="mt-10 list-none p-0">
      {items.map((child, index) => (
        <li key={index} className="relative pb-12 pl-10 last:pb-0 sm:pl-14">
          {index < items.length - 1 && (
            <span
              aria-hidden
              className="absolute bottom-0 left-[13px] top-9 w-px bg-[linear-gradient(rgb(var(--neon)/0.35),rgb(255_255_255/0.08)_40%)]"
            />
          )}
          <span
            aria-hidden
            className="absolute left-0 top-0 grid size-7 place-items-center rounded-full border border-[rgb(var(--neon)/0.45)] bg-[#07090c] font-mono text-xs text-[rgb(var(--neon))] shadow-[0_0_14px_-4px_rgb(var(--neon)/0.6)]"
          >
            {index + 1}
          </span>
          {child}
        </li>
      ))}
    </ol>
  );
}

function Step({ id, title, level = 3, children }: { id: string; title: string; level?: 2 | 3; children: React.ReactNode }) {
  const Heading = level === 2 ? H2 : H3;
  return (
    <>
      <Heading id={id} className="mt-0 leading-7">
        {title}
      </Heading>
      <div className="[&>*:first-child]:mt-3">{children}</div>
    </>
  );
}

/* Code ------------------------------------------------------------------------------------------ */


type CodeBlockProps = {
  code: string;
  lang?: Lang;
  /** A filename or label for the header bar. */
  title?: string;
  /** 1-based line numbers to light up. */
  highlight?: number[];
  className?: string;
};

function CodeBlock({ code, lang = "sh", title, highlight: lit, className }: CodeBlockProps) {
  const copy = copyText(code, lang);
  if (!title) {
    // The copy button gets its own column, so long lines scroll beneath nothing.
    return (
      <figure className={cn(codeFrame, "flex items-start", className)}>
        <Pre code={code} lang={lang} lit={lit} className="min-w-0 flex-1" />
        <div className="shrink-0 py-3 pr-2">
          <CopyButton size="sm" value={copy} aria-label="Copy code" />
        </div>
      </figure>
    );
  }
  return (
    <figure className={cn(codeFrame, className)}>
      <figcaption className="flex h-10 items-center justify-between gap-3 border-b border-white/[0.06] pl-4 pr-1 sm:pl-5">
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-white/60">
          <FileCode2 aria-hidden className="size-3.5 shrink-0 text-white/50" />
          <span className="truncate">{title}</span>
        </span>
        <CopyButton size="sm" value={copy} aria-label={`Copy ${title}`} />
      </figcaption>
      <Pre code={code} lang={lang} lit={lit} />
    </figure>
  );
}

/* Tables ---------------------------------------------------------------------------------------- */

type Flag = {
  flag: string;
  /** The argument the flag takes, e.g. "<name>". */
  arg?: string;
  default?: string;
  description: React.ReactNode;
};

function FlagTable({ flags, label }: { flags: Flag[]; label: string }) {
  return (
    <Table density="compact" containerClassName="mt-6" aria-label={label}>
      <TableHeader>
        <TableRow>
          <TableHead>Flag</TableHead>
          <TableHead>Default</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flags.map((flag) => (
          <TableRow key={flag.flag}>
            <TableCell className="whitespace-nowrap align-top font-mono text-[12.5px] text-white">
              {flag.flag}
              {flag.arg && <span className="text-white/60"> {flag.arg}</span>}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top font-mono text-[12.5px] text-white/60">
              {flag.default ?? "–"}
            </TableCell>
            <TableCell className="min-w-[17rem] align-top text-white/70">{flag.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RefTable({ head, rows, label }: { head: string[]; rows: React.ReactNode[][]; label: string }) {
  return (
    <Table density="compact" containerClassName="mt-6" aria-label={label}>
      <TableHeader>
        <TableRow>
          {head.map((cell) => (
            <TableHead key={cell}>{cell}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {row.map((cell, i) => (
              <TableCell
                key={i}
                className={cn(
                  "align-top",
                  i === 0 ? "whitespace-nowrap font-mono text-[12.5px] text-white" : "min-w-[12rem] text-white/70",
                )}
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* Link list ------------------------------------------------------------------------------------- */

function LinkList({ items }: { items: { href: string; title: string; description: string; mono?: boolean }[] }) {
  return (
    <ul className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={cn(
              "group/link relative flex items-center gap-6 py-5 pr-1 transition-colors duration-150",
              "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
            )}
          >
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-[15px] font-medium text-white transition-colors duration-150 group-hover/link:text-[rgb(var(--neon))]",
                  item.mono && "font-mono text-[14px]",
                )}
              >
                {item.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-white/60">{item.description}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-white/40 transition-[transform,color] duration-200 ease-out group-hover/link:translate-x-1 group-hover/link:text-[rgb(var(--neon))]"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

const mdxComponents = {
  h2: H2,
  h3: H3,
  p: P,
  ul: UL,
  ol: OL,
  a: A,
  code: Code,
  strong: Strong,
  Callout,
  Steps,
  Step,
  CodeBlock,
  CodeTabs,
  PackageTabs,
  FlagTable,
  RefTable,
  LinkList,
  Kbd,
  KbdCombo,
};

export {
  H2,
  H3,
  P,
  UL,
  OL,
  A,
  Code,
  Strong,
  Callout,
  Steps,
  Step,
  CodeBlock,
  Pre,
  PackageTabs,
  CodeTabs,
  TabChoiceProvider,
  FlagTable,
  RefTable,
  LinkList,
  Kbd,
  KbdCombo,
  mdxComponents,
};
