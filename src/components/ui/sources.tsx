"use client";

import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArrowUpRight } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export interface Source {
  title: string;
  url: string;
  /** Shown instead of the url's host. */
  domain?: string;
  /** A passage from the page. The preview shows it under the title. */
  snippet?: string;
  /** ISO date: `2024-09-26`, or `2002-07` for a month. */
  date?: string;
  /** Short qualifier next to the domain, such as "Issue #2141" or "§ 5.6". */
  meta?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `2024-09-26` → "Sep 26, 2024", `2002-07` → "Jul 2002". Parsed by hand so server and client agree. */
function formatDate(date?: string) {
  if (!date) return undefined;
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(date);
  if (!match) return date;
  const [, year, month, day] = match;
  if (!month) return year;
  const name = MONTHS[Number(month) - 1];
  if (!name) return year;
  return day ? `${name} ${Number(day)}, ${year}` : `${name} ${year}`;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Host and path without the scheme, for the preview's footer. */
function addressOf(url: string) {
  try {
    const { hostname, pathname, hash } = new URL(url);
    return `${hostname.replace(/^www\./, "")}${pathname === "/" ? "" : pathname}${hash}`;
  } catch {
    return url;
  }
}

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

const linkTarget = (url: string) => (isExternal(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

interface SourcesContextValue {
  sources: Source[];
  active: number | null;
  light: (index: number) => void;
  release: (index: number) => void;
}

const SourcesContext = React.createContext<SourcesContextValue | null>(null);

/** Lights `index` while `lit` holds, and lets go only if nothing else has taken over since. */
function useLight(context: SourcesContextValue | null, index: number, lit: boolean) {
  const light = context?.light;
  const release = context?.release;
  React.useEffect(() => {
    if (!light || !release || !lit) return;
    light(index);
    return () => release(index);
  }, [light, release, index, lit]);
}

export interface SourcesProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** The sources, in citation order. `<Citation index={1} />` is the first one. */
  sources: Source[];
  color?: NeonColor;
}

/** Holds the sources for the citations and lists inside it, and links their light. */
const Sources = React.forwardRef<HTMLDivElement, SourcesProps>(
  ({ sources, color, className, style, ...props }, ref) => {
    const [active, setActive] = React.useState<number | null>(null);
    const light = React.useCallback((index: number) => setActive(index), []);
    const release = React.useCallback(
      (index: number) => setActive((current) => (current === index ? null : current)),
      [],
    );
    const value = React.useMemo(() => ({ sources, active, light, release }), [sources, active, light, release]);

    return (
      <SourcesContext.Provider value={value}>
        <div
          ref={ref}
          data-active-source={active ?? undefined}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", className)}
          {...props}
        />
      </SourcesContext.Provider>
    );
  },
);
Sources.displayName = "Sources";

// The index plate: unlit glass at rest; it strikes at once and decays over 300ms, like an LED.
const plate = cn(
  "inline-flex shrink-0 select-none items-center justify-center rounded-[5px] border font-mono leading-none tabular-nums",
  "border-white/[0.14] bg-white/[0.04] text-white/70",
  "transition-[color,background-color,border-color,box-shadow,text-shadow] duration-300 ease-out",
  "data-[lit]:border-[rgb(var(--neon)/0.75)] data-[lit]:bg-[rgb(var(--neon)/0.14)] data-[lit]:duration-75",
  "data-[lit]:text-[color-mix(in_srgb,rgb(var(--neon))_70%,white)]",
  "data-[lit]:shadow-[0_0_0_1px_rgb(var(--neon)/0.12),0_0_12px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))),inset_0_0_6px_rgb(var(--neon)/CALC(0.25*var(--neon-glow,1)))]",
  "data-[lit]:[text-shadow:0_0_8px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]",
);

function SourcePreview({ source, index, quote }: { source: Source; index: number; quote?: string }) {
  const passage = quote ?? source.snippet;
  const date = formatDate(source.date);
  return (
    <div className="grid gap-2.5">
      <div className="flex min-w-0 items-center gap-2 text-[12.5px] leading-5 text-white/55">
        <span data-lit="" className={cn(plate, "h-5 min-w-5 px-1 text-[11px]")}>
          {index}
        </span>
        <span className="min-w-0 max-w-[60%] shrink-0 truncate text-white/75">
          {source.domain ?? hostOf(source.url)}
        </span>
        {source.meta && (
          <>
            <span aria-hidden className="text-white/25">
              ·
            </span>
            <span className="min-w-0 truncate">{source.meta}</span>
          </>
        )}
        {date && (
          <time dateTime={source.date} className="ml-auto shrink-0 pl-2 tabular-nums">
            {date}
          </time>
        )}
      </div>
      <p className="text-[14px] font-medium leading-snug text-white/90">{source.title}</p>
      {passage && (
        <p className="line-clamp-4 border-l-2 border-[rgb(var(--neon)/0.45)] pl-3 text-[13px] leading-relaxed text-white/65">
          {passage}
        </p>
      )}
      <p className="flex min-w-0 items-center gap-1.5 pt-0.5 text-white/40">
        <span className="min-w-0 truncate font-mono text-[11.5px]">{addressOf(source.url)}</span>
        {isExternal(source.url) && <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />}
      </p>
    </div>
  );
}

function sourceName(source: Source | undefined, index: number) {
  if (!source) return `Source ${index}`;
  return `Source ${index}: ${source.title} (${source.domain ?? hostOf(source.url)})`;
}

export interface CitationProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  /** 1-based position in the `sources` of the surrounding `<Sources>`. */
  index: number;
  /** The source, when the citation isn't inside `<Sources>`. */
  source?: Source;
  /** The passage this claim rests on. Replaces the source's snippet in the preview. */
  quote?: string;
  /** Show a preview card on hover and keyboard focus. */
  preview?: boolean;
  color?: NeonColor;
}

/** An inline marker that links to its source, lights it in the list and previews it. */
const Citation = React.forwardRef<HTMLAnchorElement, CitationProps>(
  (
    {
      index,
      source: sourceProp,
      quote,
      preview = true,
      color,
      className,
      style,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(SourcesContext);
    const source = sourceProp ?? context?.sources[index - 1];
    const [hot, setHot] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    useLight(context, index, hot || open);
    const lit = hot || open || context?.active === index;

    // Props as an object so both renders below write the <a> out inline: shadcn rewrites `asChild` to Base UI's
    // `render={...}` in base-* projects, and drops it when the child is a variable.
    const markerProps: React.ComponentPropsWithoutRef<"a"> & { [data: `data-${string}`]: unknown } = {
      href: source?.url,
      ...(source ? linkTarget(source.url) : {}),
      "aria-label": sourceName(source, index),
      "data-lit": lit ? "" : undefined,
      "data-citation": index,
      style: neonVars(color, style),
      onPointerEnter: (event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") setHot(true);
      },
      onPointerLeave: (event) => {
        onPointerLeave?.(event);
        setHot(false);
      },
      onFocus: (event) => {
        onFocus?.(event);
        setHot(true);
      },
      onBlur: (event) => {
        onBlur?.(event);
        setHot(false);
      },
      className: cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        plate,
        // Inline, not inline-flex: an atomic box after a word is a break opportunity, inline text glued to it is not.
        "relative ml-[0.2em] mr-[0.06em] inline whitespace-nowrap px-[0.45em] py-[0.2em] align-[0.14em] text-[0.7em] no-underline outline-none",
        source ? "cursor-pointer hover:border-white/30 hover:text-white/90" : "cursor-default opacity-60",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        className,
      ),
      ...props,
    };

    if (!preview || !source)
      return (
        <a ref={ref} {...markerProps}>
          {index}
        </a>
      );

    return (
      <HoverCard openDelay={220} closeDelay={160} onOpenChange={setOpen}>
        <HoverCardTrigger asChild>
          <a ref={ref} {...markerProps}>
            {index}
          </a>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-[min(21rem,calc(100vw-24px))]">
          <SourcePreview source={source} index={index} quote={quote} />
        </HoverCardContent>
      </HoverCard>
    );
  },
);
Citation.displayName = "Citation";

/** Keeps the arrow with the title's last word, so it never wraps onto a line alone. */
function TitleWithArrow({ title }: { title: string }) {
  const cut = title.lastIndexOf(" ");
  return (
    <>
      {cut > 0 ? `${title.slice(0, cut)} ` : ""}
      <span className="whitespace-nowrap">
        {title.slice(cut + 1)}
        <ArrowUpRight
          aria-hidden
          className="ml-1.5 inline-block size-3.5 align-[-1px] text-white/35 transition-[color,transform] duration-200 ease-out group-data-[lit]/source:-translate-y-px group-data-[lit]/source:translate-x-px group-data-[lit]/source:text-white/70"
        />
      </span>
    </>
  );
}

function ListItem({ source, index, context }: { source: Source; index: number; context: SourcesContextValue | null }) {
  const [hot, setHot] = React.useState(false);
  useLight(context, index, hot);
  const lit = hot || context?.active === index;
  const date = formatDate(source.date);

  return (
    <li>
      <a
        href={source.url}
        {...linkTarget(source.url)}
        data-lit={lit ? "" : undefined}
        onPointerEnter={(event) => event.pointerType === "mouse" && setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        className={cn(
          "group/source -mx-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 rounded-[10px] px-3 py-3 outline-none",
          "transition-[background-color] duration-300 ease-out data-[lit]:bg-white/[0.035] data-[lit]:duration-75",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        )}
      >
        <span data-lit={lit ? "" : undefined} className={cn(plate, "mt-px h-6 min-w-6 px-1 text-[12px]")}>
          {index}
        </span>
        <span className="grid min-w-0 gap-1">
          <span className="text-[14.5px] font-medium leading-snug text-white/90 transition-colors duration-150 group-data-[lit]/source:text-white">
            {isExternal(source.url) ? <TitleWithArrow title={source.title} /> : source.title}
          </span>
          {/* Each item carries its own dot; the clip hides the dot of whichever item starts a line. */}
          <span className="overflow-hidden text-[12.5px] leading-5 text-white/50">
            <span className="-ml-[15px] flex min-w-0 flex-wrap items-baseline">
              {[
                <span key="domain" className="text-white/65">
                  {source.domain ?? hostOf(source.url)}
                </span>,
                source.meta && <span key="meta">{source.meta}</span>,
                date && (
                  <time key="date" dateTime={source.date} className="tabular-nums">
                    {date}
                  </time>
                ),
              ]
                .filter(Boolean)
                .map((item, i) => (
                  <span key={i} className="relative whitespace-nowrap pl-[15px]">
                    <span aria-hidden className="absolute left-[6px] text-white/25">
                      ·
                    </span>
                    {item}
                  </span>
                ))}
            </span>
          </span>
          {source.snippet && (
            <span className="mt-0.5 line-clamp-2 text-[13.5px] leading-relaxed text-white/55">{source.snippet}</span>
          )}
        </span>
      </a>
    </li>
  );
}

function ChipItem({ source, index, context }: { source: Source; index: number; context: SourcesContextValue | null }) {
  const [hot, setHot] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  useLight(context, index, hot || open);
  const lit = hot || open || context?.active === index;

  return (
    <li className="min-w-0 max-w-full">
      <HoverCard openDelay={260} closeDelay={160} onOpenChange={setOpen}>
        <HoverCardTrigger asChild>
          <a
            href={source.url}
            {...linkTarget(source.url)}
            aria-label={sourceName(source, index)}
            data-lit={lit ? "" : undefined}
            onPointerEnter={(event) => event.pointerType === "mouse" && setHot(true)}
            onPointerLeave={() => setHot(false)}
            onFocus={() => setHot(true)}
            onBlur={() => setHot(false)}
            className={cn(
              "group/chip flex h-8 min-w-0 max-w-[20rem] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] pl-1 pr-2.5 text-[13px] text-white/75 outline-none",
              "transition-[border-color,background-color,color] duration-300 ease-out",
              "data-[lit]:border-white/[0.18] data-[lit]:bg-white/[0.06] data-[lit]:text-white/95 data-[lit]:duration-75",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            )}
          >
            <span data-lit={lit ? "" : undefined} className={cn(plate, "h-6 min-w-6 px-1 text-[11.5px]")}>
              {index}
            </span>
            <span className="min-w-0 truncate">
              {source.domain ?? hostOf(source.url)}
              {source.meta && <span className="text-white/45"> · {source.meta}</span>}
            </span>
          </a>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="w-[min(21rem,calc(100vw-24px))]">
          <SourcePreview source={source} index={index} />
        </HoverCardContent>
      </HoverCard>
    </li>
  );
}

export interface SourceListProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "color"> {
  /** `list` shows title, domain, date and snippet; `chips` shows the domain and previews the rest on hover. */
  variant?: "list" | "chips";
  /** The sources, when the list isn't inside `<Sources>`. */
  sources?: Source[];
  /** Chips only: how many to show before a "+n" button. */
  max?: number;
  /** Accessible name of the list. */
  label?: string;
  color?: NeonColor;
}

const SourceList = React.forwardRef<HTMLOListElement, SourceListProps>(
  ({ variant = "list", sources: sourcesProp, max, label = "Sources", color, className, style, ...props }, ref) => {
    const context = React.useContext(SourcesContext);
    const sources = sourcesProp ?? context?.sources ?? [];
    const [expanded, setExpanded] = React.useState(false);
    const listId = React.useId();
    const moreRef = React.useRef<HTMLLIElement>(null);

    if (variant === "chips") {
      const limit = max !== undefined && max < sources.length && !expanded ? Math.max(0, max) : sources.length;
      const hidden = sources.length - limit;
      return (
        <ol
          ref={ref}
          id={listId}
          aria-label={label}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", "flex flex-wrap items-center gap-1.5", className)}
          {...props}
        >
          {sources.slice(0, limit).map((source, i) => (
            <ChipItem key={`${i}-${source.url}`} source={source} index={i + 1} context={context} />
          ))}
          {hidden > 0 && (
            <li ref={moreRef}>
              <button
                type="button"
                aria-expanded={false}
                aria-controls={listId}
                aria-label={`Show ${hidden} more source${hidden === 1 ? "" : "s"}`}
                onClick={() => {
                  setExpanded(true);
                  // Focus the first chip that was hidden, so keyboard users land on new content.
                  requestAnimationFrame(() => {
                    const items = document.getElementById(listId)?.querySelectorAll<HTMLAnchorElement>("li > a");
                    items?.[limit]?.focus();
                  });
                }}
                className={cn(
                  "h-8 cursor-pointer rounded-lg px-2.5 text-[13px] tabular-nums text-white/55 outline-none",
                  "transition-[background-color,color] duration-150 hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.97]",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
                )}
              >
                +{hidden}
              </button>
            </li>
          )}
        </ol>
      );
    }

    return (
      <ol
        ref={ref}
        aria-label={label}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid gap-0.5", className)}
        {...props}
      >
        {sources.map((source, i) => (
          <ListItem key={`${i}-${source.url}`} source={source} index={i + 1} context={context} />
        ))}
      </ol>
    );
  },
);
SourceList.displayName = "SourceList";

export { Sources, Citation, SourceList };
