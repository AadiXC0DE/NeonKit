"use client";

import * as React from "react";
import Link from "next/link";
import { icons } from "@/components/ui/icons";
import { Plate, Readout, type Construction } from "@/registry/examples/icons/demo";
import { cn } from "@/lib/utils";

type Name = keyof typeof icons;

const names = Object.keys(icons) as Name[];
const link =
  "font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]";

/** The icon set: one glyph at specimen size with its construction drawn over it, and all of them beside it. */
export function Glyphs() {
  const [name, setName] = React.useState<Name>("PlugZap");
  const [build, setBuild] = React.useState<Construction | null>(null);
  const hoverTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const listRef = React.useRef<HTMLUListElement>(null);

  // One tab stop for the whole grid; arrows move through it.
  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const list = listRef.current;
    if (!list) return;
    const columns = getComputedStyle(list).gridTemplateColumns.split(" ").length;
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns, Home: -Infinity, End: Infinity }[
      event.key
    ];
    if (step === undefined) return;
    event.preventDefault();
    const index = Math.min(names.length - 1, Math.max(0, names.indexOf(name) + step));
    setName(names[index]);
    list.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
  };

  // Hovering sweeps across many cells; only settle on one when the pointer rests.
  const preview = (next: Name) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setName(next), 60);
  };

  return (
    <section aria-labelledby="glyphs-title" className="relative overflow-x-clip py-28 sm:py-40">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
        <div className="grid gap-x-6 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="glyphs-title" className="type-display text-balance text-[clamp(2.4rem,5vw,4.75rem)] text-fg">
              {names.length} icons, bent from glass.
            </h2>
            <p className="mt-6 max-w-[30rem] text-[16.5px] leading-[1.6] text-muted">
              Drawn for NeonKit on a 24px grid as one tube per run, with real bend radii and a blockout gap
              wherever a tube passes behind itself. Same names and props as lucide-react.
            </p>

            {/* The specimen: lit, with its construction drawn over it */}
            <div
              className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end lg:flex-col lg:items-start xl:flex-row xl:items-end"
              style={{ "--neon": "var(--neon-accent)" } as React.CSSProperties}
            >
              <Plate name={name} construction onBuild={setBuild} className="size-[min(19rem,78vw)]" />
              <div className="min-w-0">
                <code className="font-mono text-[15px] text-fg">{`<${name} />`}</code>
                <div className="mt-5 [&_dd]:text-fg [&_dt]:text-muted">
                  <Readout build={build} />
                </div>
              </div>
            </div>
          </div>

          {/* Every glyph. Hover or focus one to put it on the plate. */}
          <div className="min-w-0 lg:col-span-7 lg:pl-6">
            <ul
              ref={listRef}
              aria-label="All icons"
              onKeyDown={onKeyDown}
              className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-px max-h-[21rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_65%,transparent)] lg:max-h-[38rem] lg:[mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
              onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
            >
              {names.map((icon) => {
                const Glyph = icons[icon];
                const active = icon === name;
                return (
                  <li key={icon}>
                    <button
                      type="button"
                      aria-label={icon}
                      aria-pressed={active}
                      tabIndex={active ? 0 : -1}
                      title={icon}
                      onPointerEnter={(event) => event.pointerType === "mouse" && preview(icon)}
                      onFocus={() => setName(icon)}
                      onClick={() => setName(icon)}
                      className={cn(
                        "grid aspect-square w-full cursor-pointer place-items-center rounded-md transition-colors duration-150",
                        active
                          ? "text-[rgb(var(--neon-accent))] [filter:drop-shadow(0_0_4px_rgb(var(--neon-accent)/0.7))]"
                          : "text-white/40 hover:text-fg",
                      )}
                    >
                      <Glyph size={20} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-12 grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <pre className="overflow-x-auto font-mono text-[13.5px] leading-[1.8]">
                <span className="block text-muted">
                  <span className="select-none text-[#ff4d5e]">- </span>
                  import {"{ PlugZap }"} from &quot;lucide-react&quot;
                </span>
                <span className="block text-fg">
                  <span className="select-none text-[rgb(var(--neon-accent))]">+ </span>
                  import {"{ PlugZap }"} from &quot;@/components/ui/icons&quot;
                </span>
              </pre>
              <p className="text-[15px] text-muted">
                <Link href="/components/icons" className={link}>
                  Search all {names.length}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
