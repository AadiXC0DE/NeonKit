"use client";

import * as React from "react";
import { icons, Search, type Icon } from "@/components/ui/icons";
import { CopyButton } from "@/components/ui/copy-button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Switch } from "@/components/ui/switch";

type Name = keyof typeof icons;

// Every icon sits in exactly one set.
const SETS: [string, string][] = [
  [
    "Arrows",
    "ArrowUp ArrowDown ArrowLeft ArrowRight ArrowUpRight ArrowDownRight ArrowUpDown ArrowRightLeft ChevronUp ChevronDown ChevronLeft ChevronRight ChevronsLeft ChevronsRight ChevronsUpDown CircleArrowUp CornerDownLeft ExternalLink SquareArrowOutUpRight Undo2 Redo2 Reply RotateCcw RotateCw RefreshCw RefreshCcw Repeat Shuffle Maximize2 Minimize2 Download Upload LogIn LogOut",
  ],
  [
    "Interface",
    "Check CheckCheck X Plus Minus Menu Ellipsis EllipsisVertical GripVertical GripHorizontal Search SearchX ZoomIn Filter ListFilter Settings Settings2 Sliders SlidersHorizontal ToggleLeft ToggleRight Copy CopyPlus Trash Trash2 Pin Bookmark Link Link2 Paperclip Share Share2 Eye Power LoaderCircle Command LayoutGrid LayoutDashboard PanelLeft PanelRight PanelBottom Columns2 Rows2 Table List ListTree MousePointer MousePointer2 Hand Save Clipboard ClipboardCheck ClipboardList Move Maximize Minimize Crop Scissors Frame Columns3 Grid2x2 Grid3x3 PanelTop LayoutList LayoutTemplate Component",
  ],
  [
    "Status",
    "Info CircleAlert CircleCheck CircleHelp CircleX CirclePlus CircleMinus CircleStop CircleDot CircleDashed CircleDotDashed TriangleAlert OctagonAlert Ban Bell BellRing BellOff Siren Star Heart ThumbsUp ThumbsDown Flag Activity Gauge ShieldAlert ShieldX Badge BadgeCheck Crown Smile Meh Frown",
  ],
  [
    "Text and shapes",
    "Type Bold Italic Underline Strikethrough AlignLeft AlignCenter AlignRight AlignJustify WrapText ListOrdered ListChecks Heading Heading1 Heading2 Pilcrow Quote Hash AtSign Sigma Infinity Pencil PenLine PenTool Spline Palette Shapes Circle Square Triangle Hexagon Sparkle Sparkles",
  ],
  [
    "Files",
    "File FileText FilePen FilePlus2 FileCode FileCode2 FileCog FileImage FileSpreadsheet FileArchive FileWarning FileHeadphone FileVideoCamera Folder FolderOpen FolderInput FolderGit2 FolderKanban Archive Inbox Image Images ImagePlus ImageOff Layers Book BookOpen BookMarked Library NotebookPen Newspaper ScrollText",
  ],
  [
    "Media",
    "Play Pause SkipBack SkipForward Volume Volume1 Volume2 VolumeX Mic MicOff Music Music2 ListMusic AudioLines Headphones Speaker Radio Camera CameraOff Video VideoOff Film Clapperboard Tv Cast",
  ],
  ["Messages", "Mail MailOpen Send MessageCircle MessageSquare MessagesSquare Phone PhoneCall Megaphone Rss"],
  [
    "Devices",
    "Monitor Laptop Tablet Smartphone Watch Keyboard Mouse Printer Cpu Server Database HardDrive Plug Plug2 PlugZap Cable Battery BatteryLow BatteryFull BatteryCharging Wifi Bluetooth Signal Antenna Fan QrCode ScanLine",
  ],
  [
    "Charts",
    "ChartBar ChartColumn ChartLine ChartArea ChartScatter ChartCandlestick ChartGantt ChartNoAxesColumn ChartPie TrendingUp TrendingDown Percent SquareKanban Target",
  ],
  [
    "Code",
    "Code CodeXml Braces Variable Regex Binary Terminal SquareTerminal GitBranch GitCommitHorizontal GitMerge GitPullRequest GitFork Github Figma Bug TestTube Webhook Workflow Network Bot Brain Box Boxes Package Orbit",
  ],
  [
    "Commerce",
    "CreditCard Wallet Banknote Coins DollarSign Euro PoundSterling IndianRupee Bitcoin Receipt Tag Ticket ShoppingBag ShoppingCart Store Briefcase Landmark Scale",
  ],
  [
    "People and access",
    "User UserRound UserPlus UserMinus UserX UserCog UserRoundCheck Users UsersRound Contact IdCard PersonStanding Accessibility GraduationCap Lock LockKeyhole Unlock Key KeyRound Shield ShieldCheck Fingerprint EyeOff",
  ],
  ["Time", "Clock Timer AlarmClock Hourglass History Calendar CalendarDays CalendarPlus"],
  [
    "Places",
    "Globe Map MapPin Navigation Compass LocateFixed House Building Building2 Factory Warehouse Tent Anchor Plane PlaneTakeoff Ship TrainFront Truck Car Bike Rocket",
  ],
  [
    "Nature",
    "Sun Sunrise Sunset Moon Cloud CloudSun CloudRain CloudLightning CloudUpload Snowflake Flame Droplet Wind Waves Leaf Sprout TreePine Mountain Cat Fish Zap",
  ],
  ["Health", "HeartPulse Stethoscope Pill Thermometer"],
  [
    "Objects",
    "Lightbulb Lamp Coffee Wine Utensils Umbrella Shirt Gem DoorOpen Hammer Wand Puzzle Gift Dice5 Trophy Crosshair LifeBuoy",
  ],
];

const sets = SETS.map(([title, list]) => ({
  title,
  id: title.toLowerCase().replace(/\s+/g, "-"),
  names: list.split(" ").filter((name): name is Name => name in icons),
}));
const setOf = new Map(sets.flatMap((set) => set.names.map((name, index) => [name, { set, index }] as const)));
const TOTAL = Object.keys(icons).length;

// "ChevronsUpDown" -> " chevrons up down". A query matches from the start of a word, so "cal" finds Calendar
// but not EllipsisVertical, and "up down" finds ChevronsUpDown.
const words = (name: string) => " " + name.replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();
const matches = (name: string, set: string, q: string) =>
  words(name).includes(" " + q) || words(name).replace(/ /g, "").startsWith(q.replace(/\s+/g, "")) || set.toLowerCase().startsWith(q);

// ---- construction: read the tube runs back out of the path data ------------------------------------------

type Pt = [number, number];
export type Construction = {
  runs: number;
  bends: { c: Pt; r: number }[];
  gaps: { a: Pt; b: Pt; ends: Pt[] }[];
  radii: number[];
};

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const size = (v: Pt) => Math.hypot(v[0], v[1]);
const unit = (v: Pt): Pt => {
  const l = size(v) || 1;
  return [v[0] / l, v[1] / l];
};
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];

function arcCentre(p0: Pt, p1: Pt, r: number, sweep: number, large: boolean): Pt | null {
  const half = size(sub(p1, p0)) / 2;
  if (half > r + 0.01) return null;
  const mid: Pt = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  const u = unit(sub(p1, p0));
  const k = Math.sqrt(Math.max(0, r * r - half * half));
  for (const side of [1, -1]) {
    const c: Pt = [mid[0] - u[1] * k * side, mid[1] + u[0] * k * side];
    const a0 = Math.atan2(p0[1] - c[1], p0[0] - c[0]);
    const a1 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
    const turn = (((sweep ? a1 - a0 : a0 - a1) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (turn > Math.PI - 1e-6 === large || Math.abs(turn - Math.PI) < 1e-3) return c;
  }
  return null;
}

/** A bend is a tight arc joined to the rest of its run. Circles and lone arcs are shapes, not bends. */
function findBends(d: string) {
  const bends: Construction["bends"] = [];
  for (const run of d.split(/(?=M)/)) {
    const cmds = [...run.matchAll(/([MLACZh])([^MLACZh]*)/g)].map((m) => ({
      c: m[1],
      n: (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number),
    }));
    const drawn = cmds.filter((cmd) => cmd.c !== "M" && cmd.c !== "Z");
    const ring = drawn.every((cmd) => cmd.c === "A" && cmd.n[0] === drawn[0].n[0]);
    let p: Pt = [0, 0];
    for (const { c, n } of cmds) {
      if (c === "M" || c === "L") p = [n[0], n[1]];
      else if (c === "h") p = [p[0] + n[0], p[1]];
      else if (c === "C") p = [n[4], n[5]];
      else if (c === "A") {
        const [r, , , large, sweep, x, y] = n;
        const centre = !ring && r >= 0.9 && r <= 4.6 ? arcCentre(p, [x, y], r, sweep, Boolean(large)) : null;
        if (centre) bends.push({ c: centre, r });
        p = [x, y];
      }
    }
  }
  return bends;
}

/** A blockout is a run that stops 2–4 units short of another tube lying straight ahead of it. */
function findGaps(d: string, probe: SVGPathElement) {
  const runs = d
    .split(/(?=M)/)
    .filter(Boolean)
    .map((run) => {
      probe.setAttribute("d", run);
      const length = probe.getTotalLength();
      const steps = Math.max(2, Math.ceil(length / 0.2));
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const q = probe.getPointAtLength((length * i) / steps);
        pts.push([q.x, q.y]);
      }
      const closed = /Z\s*$/.test(run) || size(sub(pts[0], pts[steps])) < 0.05;
      return { length, pts, step: length / steps, closed };
    });

  const ends: { e: Pt; t: Pt; front: Pt }[] = [];
  runs.forEach((run, i) => {
    if (run.closed || run.length < 0.4) return;
    const back = Math.max(1, Math.round(0.4 / run.step));
    for (const atEnd of [false, true]) {
      const last = run.pts.length - 1;
      const e = run.pts[atEnd ? last : 0];
      const t = unit(sub(e, run.pts[atEnd ? last - back : back]));
      let best: { d: number; q: Pt } | null = null;
      runs.forEach((other, j) => {
        other.pts.forEach((q, k) => {
          if (j === i && Math.abs(k * other.step - (atEnd ? other.length : 0)) < 5) return;
          const v = sub(q, e);
          const dist = size(v);
          if (dist < 4.1 && dist > 0.01 && dot(unit(v), t) > 0.5 && (!best || dist < best.d)) best = { d: dist, q };
        });
      });
      const found = best as { d: number; q: Pt } | null;
      if (found && found.d > 1.8) ends.push({ e, t, front: found.q });
    }
  });

  // Two ends facing each other across a tube are one blockout; draw the hidden tube between them.
  const gaps: Construction["gaps"] = [];
  const used = new Set<number>();
  ends.forEach((a, i) => {
    if (used.has(i)) return;
    const j = ends.findIndex((b, k) => {
      if (k === i || used.has(k)) return false;
      const ab = sub(b.e, a.e);
      return size(ab) < 9 && dot(unit(ab), a.t) > 0.8 && dot(unit(sub(a.e, b.e)), b.t) > 0.8;
    });
    used.add(i);
    if (j >= 0) {
      used.add(j);
      gaps.push({ a: a.e, b: ends[j].e, ends: [a.e, ends[j].e] });
    } else gaps.push({ a: a.e, b: a.front, ends: [a.e] });
  });
  return { runs: runs.length, gaps };
}

// ---- lit tube ---------------------------------------------------------------------------------------------

/** Three passes of one glyph: a soft halo, the colored glass, and a thin white-hot core. */
function Tube({
  glyph: Glyph,
  core = 0.55,
  glow = 3,
  className,
}: {
  glyph: Icon;
  core?: number;
  glow?: number;
  className?: string;
}) {
  return (
    <span aria-hidden className={className}>
      <Glyph
        className="absolute inset-0 size-full text-[rgb(var(--neon))] opacity-60"
        strokeWidth={2.5}
        style={{ filter: `blur(${glow}px)` }}
      />
      <Glyph
        className="absolute inset-0 size-full text-[rgb(var(--neon))]"
        style={{ filter: `drop-shadow(0 0 ${glow / 3}px rgb(var(--neon) / 0.9))` }}
      />
      <Glyph className="absolute inset-0 size-full text-white/90" strokeWidth={core} />
    </span>
  );
}

const GRID = Array.from({ length: 23 }, (_, i) => `M${i + 1} 0V24M0 ${i + 1}H24`).join("");

export function Plate({
  name,
  construction: show,
  onBuild,
  className = "size-[168px] @xl:size-[192px]",
}: {
  name: Name;
  construction: boolean;
  onBuild: (build: Construction) => void;
  className?: string;
}) {
  const Glyph = icons[name];
  const ref = React.useRef<SVGSVGElement>(null);
  const probe = React.useRef<SVGPathElement>(null);
  const [build, setBuild] = React.useState<Construction | null>(null);

  React.useLayoutEffect(() => {
    const d = ref.current?.querySelector("path")?.getAttribute("d");
    // Measuring needs a layout engine; without one (tests, old browsers) the plate simply skips the overlay.
    if (!d || typeof probe.current?.getTotalLength !== "function") return;
    const bends = findBends(d);
    const { runs, gaps } = findGaps(d, probe.current);
    const next = { runs, bends, gaps, radii: [...new Set(bends.map((b) => b.r))].sort((x, y) => x - y) };
    setBuild(next);
    onBuild(next);
  }, [name, onBuild]);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" aria-hidden className="absolute inset-0 size-full overflow-visible" fill="none">
        <path
          d={GRID}
          stroke="white"
          strokeOpacity={show ? 0.055 : 0.03}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M12 0V24M0 12H24"
          stroke="white"
          strokeOpacity={show ? 0.1 : 0.04}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x={0}
          y={0}
          width={24}
          height={24}
          stroke="white"
          strokeOpacity={0.1}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {show && (
          <g stroke="white" strokeOpacity={0.09} strokeWidth={1}>
            <rect x={3} y={3} width={18} height={18} rx={3} vectorEffect="non-scaling-stroke" />
            <circle cx={12} cy={12} r={9} vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
      <Tube key={name} glyph={Glyph} glow={9} className="nk-ignite absolute inset-0" />
      <Glyph ref={ref} className="invisible absolute inset-0 size-full" />
      <svg aria-hidden className="absolute size-0">
        <path ref={probe} />
      </svg>
      {show && build && (
        <svg viewBox="0 0 24 24" aria-hidden className="absolute inset-0 size-full overflow-visible" fill="none">
          {build.bends.map(({ c, r }, i) => (
            <g key={`b${i}`} stroke="white" strokeWidth={1}>
              <circle
                cx={c[0]}
                cy={c[1]}
                r={r}
                strokeOpacity={0.4}
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={`M${c[0] - 0.35} ${c[1]}h0.7M${c[0]} ${c[1] - 0.35}v0.7`}
                strokeOpacity={0.55}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
          {build.gaps.map(({ a, b, ends }, i) => (
            <g key={`g${i}`}>
              <path
                d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`}
                stroke="white"
                strokeOpacity={0.6}
                strokeWidth={1}
                strokeDasharray="1.5 2.5"
                vectorEffect="non-scaling-stroke"
              />
              {ends.map((p, k) => (
                <circle
                  key={k}
                  cx={p[0]}
                  cy={p[1]}
                  r={0.3}
                  fill="#07080d"
                  stroke="white"
                  strokeOpacity={0.85}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

export function Readout({ build }: { build: Construction | null }) {
  const rows = [
    ["Stroke", "1.75"],
    ["Runs", build ? String(build.runs) : "–"],
    ["Bends", build ? String(build.bends.length) : "–"],
    ["Radii", build ? build.radii.join(" ") || "–" : "–"],
    ["Blockouts", build ? String(build.gaps.length) : "–"],
  ];
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[12.5px] text-white/55">{label}</dt>
          <dd className="mt-1 font-mono text-[13px] tabular-nums text-white/90">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---- browser ----------------------------------------------------------------------------------------------

export default function IconsBrowser() {
  const [selected, setSelected] = React.useState<Name>("Command");
  const [query, setQuery] = React.useState("");
  const [construction, setConstruction] = React.useState(true);
  const [build, setBuild] = React.useState<Construction | null>(null);
  const [activeSet, setActiveSet] = React.useState(sets[0].id);
  const [announce, setAnnounce] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const shown = React.useMemo(
    () =>
      sets
        .map((set) => ({
          ...set,
          names: q
            ? set.names.filter((name) => matches(name, set.title, q))
            : set.names,
        }))
        .filter((set) => set.names.length > 0),
    [q],
  );
  const count = shown.reduce((n, set) => n + set.names.length, 0);
  const flat = shown.flatMap((set) => set.names);
  const tabStop = flat.includes(selected) ? selected : flat[0];

  // "/" jumps to the search field from anywhere on the page, unless you're already typing.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const Selected = icons[selected];
  const place = setOf.get(selected);
  const jsx = `<${selected} />`;

  function copyName(name: Name) {
    const text = `<${name} />`;
    navigator.clipboard?.writeText(text).then(
      () => setAnnounce(`Copied ${text}`),
      () => setAnnounce(`Couldn't copy. ${text}`),
    );
  }

  function move(event: React.KeyboardEvent<HTMLButtonElement>, name: Name) {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-icon]") ?? [])];
    const index = buttons.indexOf(event.currentTarget);
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowRight") next = buttons[index + 1];
    else if (event.key === "ArrowLeft") next = buttons[index - 1];
    else if (event.key === "Home") next = buttons[0];
    else if (event.key === "End") next = buttons[buttons.length - 1];
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      // Rows break at set headings, so step by position, not by a fixed column count.
      const here = event.currentTarget.getBoundingClientRect();
      const down = event.key === "ArrowDown";
      const ahead = buttons.filter((b) => {
        const top = b.getBoundingClientRect().top;
        return down ? top > here.top + 4 : top < here.top - 4;
      });
      if (ahead.length) {
        const rowTop = ahead.reduce(
          (best, b) => {
            const top = b.getBoundingClientRect().top;
            return down ? Math.min(best, top) : Math.max(best, top);
          },
          down ? Infinity : -Infinity,
        );
        next = ahead
          .filter((b) => Math.abs(b.getBoundingClientRect().top - rowTop) < 4)
          .sort(
            (a, b) =>
              Math.abs(a.getBoundingClientRect().left - here.left) -
              Math.abs(b.getBoundingClientRect().left - here.left),
          )[0];
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.key === "Enter") copyName(name);
      setSelected(name);
      return;
    } else return;
    event.preventDefault();
    if (!next) return;
    next.focus();
    next.scrollIntoView({ block: "nearest" });
    setSelected(next.dataset.icon as Name);
  }

  // After a jump to one of the last sets the list can't scroll that set to the top, so the jump wins until the
  // reader scrolls by hand.
  const jumped = React.useRef<string | null>(null);

  function onScroll() {
    const list = listRef.current;
    if (!list) return;
    const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
    if (atBottom && jumped.current) return setActiveSet(jumped.current);
    const sections = [...list.querySelectorAll<HTMLElement>("[data-set]")];
    const top = list.scrollTop + 12;
    const current = sections.filter((section) => section.offsetTop <= top).pop() ?? sections[0];
    if (current) setActiveSet(current.dataset.set!);
  }

  function jump(id: string) {
    const list = listRef.current;
    const section = list?.querySelector<HTMLElement>(`[data-set="${id}"]`);
    if (!list || !section) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    jumped.current = id;
    list.scrollTo({ top: section.offsetTop, behavior: still ? "auto" : "smooth" });
    setActiveSet(id);
  }

  return (
    <div className="@container w-full min-w-0">
      <style>{`
        @keyframes nk-ignite { 0% { opacity: 0 } 10% { opacity: .9 } 18% { opacity: .2 } 30% { opacity: 1 } 40% { opacity: .55 } 56%, 100% { opacity: 1 } }
        .nk-ignite { animation: nk-ignite 420ms linear both }
        @media (prefers-reduced-motion: reduce) { .nk-ignite { animation: none } }
      `}</style>

      {/* Inspector */}
      <section
        aria-label={`Selected icon: ${selected}`}
        className="flex flex-col items-center gap-7 @xl:flex-row @xl:items-stretch @xl:gap-9"
      >
        <Plate name={selected} construction={construction} onBuild={setBuild} />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[26px] font-semibold leading-none tracking-[-0.03em] text-white/95 [font-stretch:112%] @xl:text-[30px]">
                {selected}
              </p>
              <p className="mt-2 text-[13px] text-white/55">
                {place ? `${place.set.title}, ${place.index + 1} of ${place.set.names.length}` : null}
              </p>
            </div>
            <div aria-hidden className="flex shrink-0 items-end gap-3.5 text-white/85">
              {[16, 20, 24, 32].map((px) => (
                <span key={px} className="flex flex-col items-center gap-1.5">
                  <Selected size={px} />
                  <span className="font-mono text-[11px] tabular-nums text-white/55">{px}</span>
                </span>
              ))}
            </div>
          </div>
          <Readout build={build} />
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex h-9 min-w-[11rem] flex-1 items-center rounded-lg border border-white/10 bg-white/[0.03] pl-3 pr-0.5">
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/85">{jsx}</code>
              <CopyButton value={jsx} size="sm" aria-label={`Copy ${jsx}`} copiedLabel="Copied JSX" />
            </div>
            <Switch checked={construction} onCheckedChange={setConstruction} size="sm" label="Construction" />
          </div>
        </div>
      </section>

      {/* Browser */}
      <div className="mt-8 border-t border-white/[0.07] pt-6">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchRef}
            type="search"
            aria-label="Search icons"
            placeholder={`Search ${TOTAL} icons`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
              } else if (event.key === "ArrowDown" && flat.length) {
                event.preventDefault();
                listRef.current?.querySelector<HTMLButtonElement>(`[data-icon="${tabStop}"]`)?.focus();
                setSelected(tabStop);
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            {q ? (
              <InputGroupText className="tabular-nums">{count} found</InputGroupText>
            ) : (
              <Kbd size="sm" listen="/">
                /
              </Kbd>
            )}
          </InputGroupAddon>
        </InputGroup>

        <div className="mt-4 grid min-w-0 gap-5 @xl:grid-cols-[9.5rem_minmax(0,1fr)]">
          <nav
            aria-label="Icon sets"
            className="-mx-1 flex min-w-0 gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] @xl:[mask-image:none] @xl:mx-0 @xl:flex-col @xl:gap-0 @xl:overflow-visible"
          >
            {shown.map((set) => (
              <button
                key={set.id}
                type="button"
                onClick={() => jump(set.id)}
                aria-current={activeSet === set.id || undefined}
                className={
                  "flex h-8 shrink-0 cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-md px-2 text-left text-[13px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] @xl:h-7 " +
                  (activeSet === set.id ? "bg-white/[0.06] text-white/95" : "text-white/55 hover:text-white/85")
                }
              >
                {set.title}
                <span className="hidden font-mono text-[11px] tabular-nums text-white/40 @xl:inline">
                  {set.names.length}
                </span>
              </button>
            ))}
          </nav>

          <div
            ref={listRef}
            onScroll={onScroll}
            onWheel={() => (jumped.current = null)}
            onTouchMove={() => (jumped.current = null)}
            role="listbox"
            aria-label="Icons"
            className="relative h-[360px] min-w-0 overflow-y-auto overscroll-contain [scrollbar-color:rgb(255_255_255/0.12)_transparent] [scrollbar-width:thin] @xl:h-[400px]"
          >
            {shown.map((set) => (
              <div key={set.id} role="group" aria-labelledby={`icons-set-${set.id}`} data-set={set.id} className="pb-4">
                <p
                  id={`icons-set-${set.id}`}
                  className="sticky top-0 z-10 bg-[#07080d] pb-2 pt-1 text-[13px] text-white/55"
                >
                  {set.title}
                </p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))]">
                  {set.names.map((name) => {
                    const Glyph = icons[name];
                    const on = name === selected;
                    return (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={on}
                        aria-label={name}
                        title={name}
                        data-icon={name}
                        tabIndex={name === tabStop ? 0 : -1}
                        onClick={() => setSelected(name)}
                        onDoubleClick={() => copyName(name)}
                        onKeyDown={(event) => move(event, name)}
                        className={
                          "group relative grid aspect-square cursor-pointer place-items-center rounded-lg outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)] " +
                          (on ? "bg-[rgb(var(--neon)/0.08)]" : "text-white/70 hover:bg-white/[0.04] hover:text-white")
                        }
                      >
                        {on ? (
                          <Tube key={name} glyph={Glyph} core={0.7} glow={2.5} className="nk-ignite relative size-6" />
                        ) : (
                          <Glyph aria-hidden className="size-6" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {count === 0 && (
              <p className="pt-16 text-center text-sm text-white/55">
                Nothing called “{query.trim()}”. Names follow lucide: try alert, chevron or file.
              </p>
            )}
          </div>
        </div>
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>
        <p className="mt-4 hidden text-[13px] text-white/55 @xl:block">
          Arrow keys move, Enter or double-click copies the JSX, <span className="font-mono">/</span> searches.
        </p>
      </div>
    </div>
  );
}
