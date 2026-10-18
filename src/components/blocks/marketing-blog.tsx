"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

type Category = "Infrastructure" | "Frontend" | "Data" | "Incidents";

type Art = "cylinders" | "plan" | "rack" | "browser" | "components" | "spike" | "rotation";

type Post = {
  title: string;
  art: Art;
  dek?: string;
  category: Category;
  minutes: number;
  author: string;
  initials: string;
  role: string;
  date: string;
  fig: number;
};

const FEATURED: Post = {
  title: "We moved 41 TB off a dying Postgres cluster without a maintenance window",
  dek: "Logical replication, a dual-write shim we deleted after nine days, and the one table that fought us the whole way.",
  category: "Data",
  art: "cylinders",
  minutes: 14,
  author: "Priya Raman",
  initials: "PR",
  role: "Staff engineer, storage",
  date: "Sep 30, 2026",
  fig: 41,
};

const POSTS: Post[] = [
  { title: "The pager rotation we actually like", category: "Incidents", art: "rotation", minutes: 8, author: "Tomás Ibarra", initials: "TI", role: "SRE", date: "Sep 23, 2026", fig: 40 },
  { title: "Shaving 180 ms off first paint by deleting a font", category: "Frontend", art: "browser", minutes: 6, author: "Elin Sato", initials: "ES", role: "Frontend", date: "Sep 16, 2026", fig: 39 },
  { title: "Why every rack has labels on both ends", category: "Infrastructure", art: "rack", minutes: 5, author: "Kofi Mensah", initials: "KM", role: "Datacenter ops", date: "Sep 9, 2026", fig: 38 },
  { title: "Postmortem: the 41-minute DNS outage on August 28", category: "Incidents", art: "spike", minutes: 11, author: "Tomás Ibarra", initials: "TI", role: "SRE", date: "Sep 2, 2026", fig: 37 },
  { title: "Reading EXPLAIN ANALYZE without guessing", category: "Data", art: "plan", minutes: 9, author: "Priya Raman", initials: "PR", role: "Storage", date: "Aug 26, 2026", fig: 36 },
  { title: "A design system with 14 components, on purpose", category: "Frontend", art: "components", minutes: 7, author: "Elin Sato", initials: "ES", role: "Frontend", date: "Aug 19, 2026", fig: 35 },
];

const CATEGORIES: Category[] = ["Infrastructure", "Frontend", "Data", "Incidents"];

const GLASS = "rgb(255 255 255 / 0.16)";
const LIT = "color-mix(in srgb, rgb(var(--neon)) 40%, white)";

const Bright = React.createContext(false);

// The one lit stroke in each drawing: a near-white core with a halo behind it.
// Only the featured cover burns at full strength until you hover a card.
function Lit({ children }: { children: React.ReactNode }) {
  const bright = React.useContext(Bright);
  return (
    <g fill="none">
      <g
        stroke="rgb(var(--neon))"
        strokeWidth={6}
        className={cn(
          "[filter:blur(4px)] transition-opacity duration-300 group-hover/post:opacity-90",
          bright ? "opacity-60" : "opacity-20",
        )}
      >
        {children}
      </g>
      <g stroke={LIT} strokeWidth={2}>{children}</g>
    </g>
  );
}

// Technical drawings, one per category, on blueprint paper.
function Cover({ art, fig, bright = false, className }: { art: Art; fig: number; bright?: boolean; className?: string }) {
  return (
    <Bright.Provider value={bright}>
      <div
        className={cn(
          "relative overflow-hidden bg-[#08090d] bg-[linear-gradient(rgb(var(--neon)/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--neon)/0.05)_1px,transparent_1px)] bg-[size:20px_20px]",
          className,
        )}
      >
        <div aria-hidden className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.08)] blur-[50px]" />
        <svg aria-hidden viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" strokeLinecap="round" strokeLinejoin="round">
          {art === "cylinders" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25}>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${118 + i * 82} ${70 + (i % 2) * 18})`}>
                  <ellipse cx={0} cy={0} rx={34} ry={10} />
                  <path d="M-34 0v78a34 10 0 0 0 68 0V0" />
                  <path d="M-34 26a34 10 0 0 0 68 0M-34 52a34 10 0 0 0 68 0" strokeDasharray="3 4" />
                </g>
              ))}
              <path d="M152 112h48M234 112h48" strokeDasharray="2 5" />
              <Lit>
                <path d="M200 106l12 6-12 6" />
                <ellipse cx={200} cy={88} rx={34} ry={10} />
              </Lit>
            </g>
          )}
          {art === "plan" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25} fontFamily="ui-monospace, monospace" fontSize={9}>
              <path d="M200 70v22M200 92H130v26M200 92h70v26M130 140v22M130 162H92v18M130 162h40v18" />
              <rect x={150} y={44} width={100} height={26} rx={4} />
              <rect x={84} y={118} width={92} height={22} rx={4} />
              <rect x={224} y={118} width={92} height={22} rx={4} />
              <rect x={56} y={180} width={72} height={22} rx={4} />
              <Lit>
                <rect x={134} y={180} width={72} height={22} rx={4} />
              </Lit>
              <g fill="rgb(255 255 255 / 0.4)" stroke="none">
                <text x={170} y={60}>Hash Join</text>
                <text x={98} y={132}>Nested Loop</text>
                <text x={240} y={132}>Index Scan</text>
                <text x={70} y={194}>Index</text>
                <text x={146} y={194} fill={LIT}>Seq Scan</text>
                <text x={214} y={194}>1.2M rows</text>
              </g>
            </g>
          )}
          {art === "components" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25}>
              {Array.from({ length: 14 }, (_, i) => {
                const x = 62 + (i % 7) * 42;
                const y = 82 + Math.floor(i / 7) * 54;
                return i === 9 ? null : <rect key={i} x={x} y={y} width={32} height={40} rx={i % 3 === 0 ? 16 : 5} />;
              })}
              <Lit>
                <rect x={146} y={136} width={32} height={40} rx={5} />
              </Lit>
              <path d="M62 60h284" strokeDasharray="2 6" />
              <text x={62} y={52} fill="rgb(255 255 255 / 0.35)" stroke="none" fontSize={10} fontFamily="ui-monospace, monospace">14 / 14</text>
            </g>
          )}
          {art === "rotation" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25}>
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} d={`M${70 + i * 37} 50v150`} strokeDasharray={i % 7 === 0 ? undefined : "2 5"} />
              ))}
              {[0, 1, 3].map((row) => (
                <rect key={row} x={70 + ((row * 2) % 5) * 37 + 4} y={64 + row * 34} width={103} height={14} rx={7} />
              ))}
              <Lit>
                <rect x={70 + 4 * 37 + 4} y={132} width={103} height={14} rx={7} />
              </Lit>
              <text x={70} y={42} fill="rgb(255 255 255 / 0.35)" stroke="none" fontSize={10} fontFamily="ui-monospace, monospace">wk 39, primary</text>
            </g>
          )}
          {art === "rack" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25}>
              <rect x={130} y={36} width={140} height={178} rx={6} />
              {Array.from({ length: 7 }, (_, i) => (
                <g key={i}>
                  <rect x={142} y={48 + i * 23} width={116} height={16} rx={2} />
                  <circle cx={150} cy={56 + i * 23} r={1.6} fill={GLASS} />
                </g>
              ))}
              <Lit>
                <rect x={142} y={117} width={116} height={16} rx={2} />
              </Lit>
              <path d="M270 125h44M314 125v-60h30" strokeDasharray="3 4" />
              <text x={350} y={68} fill="rgb(255 255 255 / 0.35)" stroke="none" fontSize={10} fontFamily="ui-monospace, monospace">U14</text>
            </g>
          )}
          {art === "browser" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25}>
              <rect x={70} y={40} width={260} height={170} rx={8} />
              <path d="M70 62h260" />
              {[84, 96, 108].map((x) => (
                <circle key={x} cx={x} cy={51} r={3} />
              ))}
              <rect x={86} y={78} width={140} height={12} rx={2} />
              <rect x={86} y={98} width={96} height={6} rx={2} />
              <rect x={240} y={78} width={74} height={116} rx={4} strokeDasharray="3 4" />
              <rect x={86} y={150} width={66} height={44} rx={4} />
              <rect x={160} y={150} width={66} height={44} rx={4} />
              <Lit>
                <rect x={86} y={116} width={140} height={24} rx={4} />
              </Lit>
            </g>
          )}
          {art === "spike" && (
            <g fill="none" stroke={GLASS} strokeWidth={1.25}>
              <path d="M50 200h300M50 200V40" />
              {[160, 120, 80].map((y) => (
                <path key={y} d={`M50 ${y}h300`} strokeDasharray="2 6" />
              ))}
              <path d="M50 176l24-6 22 4 22-8 22 5 20-3" />
              <path d="M232 180l24 4 22-6 22 3 22-4 28 2" />
              <Lit>
                <path d="M160 168l14-104 16 120 14-60 14 52" />
              </Lit>
              <text x={180} y={54} fill="rgb(255 255 255 / 0.4)" stroke="none" fontSize={10} fontFamily="ui-monospace, monospace">p99 2.9 s</text>
            </g>
          )}
        </svg>
        <span aria-hidden className="absolute bottom-3 left-4 hidden font-mono text-[11px] text-white/35 sm:block">
          fig. {fig}
        </span>
      </div>
    </Bright.Provider>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-[13px]">
      <span className="text-[rgb(var(--neon))]">{post.category}</span>
      <span className="text-white/55">{post.minutes} min read</span>
    </p>
  );
}

function Byline({ post, size = "sm" }: { post: Post; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar alt="" fallback={post.initials} size={size} />
      <div className="min-w-0 text-[13px] leading-tight">
        <p className="truncate text-white/85">{post.author}</p>
        <p className="mt-0.5 truncate text-white/60">
          {post.role} · {post.date}
        </p>
      </div>
    </div>
  );
}

// Taller pills on touch screens, the compact size from sm up.
const FILTER_ITEM = "h-8 sm:h-6";

const linkClass =
  "group/post block outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

export default function MarketingBlog() {
  const [category, setCategory] = React.useState<"all" | Category>("all");
  const posts = POSTS.filter((post) => category === "all" || post.category === category);

  return (
    <section
      aria-labelledby="field-manual-title"
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative isolate bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-8 border-b border-white/[0.08] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="field-manual-title"
            className="text-[clamp(2.1rem,5.6vw,4.75rem)] font-[620] leading-[0.96] tracking-[-0.045em] text-white [font-stretch:112%]"
          >
            Written by the people
            <br />
            <span className="text-white/50">who get paged.</span>
          </h2>
          <div className="flex flex-col gap-2 text-[14px] lg:items-end lg:pb-2 lg:text-right">
            <p className="text-white/60">
              <span className="text-white/90">Field Manual</span>, engineering notes, vol. 6
            </p>
            <a
              href="#"
              className="inline-flex w-fit items-center gap-1.5 rounded-md text-white/55 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              Subscribe by RSS <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>

        <article className="mt-10">
          <a href="#" className={cn(linkClass, "grid gap-8 rounded-[20px] lg:grid-cols-12 lg:gap-10")}>
            <Cover
              art={FEATURED.art}
              fig={FEATURED.fig}
              bright
              className="aspect-[16/10] rounded-[20px] border border-white/10 transition-[border-color] duration-300 group-hover/post:border-[rgb(var(--neon)/0.35)] lg:col-span-7 lg:aspect-auto lg:min-h-[440px]"
            />
            <div className="flex flex-col lg:col-span-5 lg:py-2">
              <Meta post={FEATURED} />
              <h3 className="mt-4 text-[clamp(1.75rem,2.5vw,2.25rem)] font-[620] leading-[1.04] tracking-[-0.035em] text-white transition-colors [font-stretch:108%] group-hover/post:text-[color-mix(in_srgb,rgb(var(--neon))_25%,white)]">
                {FEATURED.title}
              </h3>
              <p className="mt-5 text-[16px] leading-[1.6] text-white/60">{FEATURED.dek}</p>
              <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/[0.08] pt-5 lg:mt-auto">
                <Byline post={FEATURED} size="md" />
                <ArrowRight aria-hidden className="mb-2 size-5 shrink-0 text-white/35 transition-[color,transform] duration-200 group-hover/post:translate-x-1 group-hover/post:text-[rgb(var(--neon))]" />
              </div>
            </div>
          </a>
        </article>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-[22px] font-[620] tracking-[-0.03em] text-white/90 [font-stretch:108%]">Recent</h3>
          <div className="-mx-6 max-w-[calc(100%+3rem)] overflow-x-auto overscroll-x-contain px-6 sm:mx-0 sm:max-w-full sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ToggleGroup aria-label="Filter by category" size="sm" value={category} onValueChange={(value) => setCategory(value as typeof category)}>
              <ToggleGroupItem value="all" className={FILTER_ITEM}>All</ToggleGroupItem>
              {CATEGORIES.map((item) => (
                <ToggleGroupItem key={item} value={item} className={FILTER_ITEM}>
                  {item}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <ul className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.title}>
              <article>
                <a href="#" className={cn(linkClass, "grid grid-cols-[104px_1fr] items-start gap-4 rounded-2xl sm:block")}>
                  <Cover
                    art={post.art}
                    fig={post.fig}
                    className="aspect-square rounded-xl sm:aspect-[16/10] sm:rounded-2xl border border-white/10 transition-[border-color] duration-300 group-hover/post:border-[rgb(var(--neon)/0.35)]"
                  />
                  <div className="min-w-0 sm:mt-5">
                    <Meta post={post} />
                    <h4 className="mt-2 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-white/90 transition-colors group-hover/post:text-white sm:mt-2.5 sm:text-[19px]">
                      {post.title}
                    </h4>
                    <div className="mt-3 sm:mt-5">
                      <Byline post={post} />
                    </div>
                  </div>
                </a>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/60">112 posts since 2021. No ghostwriters, no growth posts.</p>
          <a
            href="#"
            className="inline-flex w-fit items-center gap-1.5 rounded-md text-white/70 outline-none transition-colors hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            Browse the archive <ArrowRight aria-hidden className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
