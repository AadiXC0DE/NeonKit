import * as React from "react";
import { cn } from "@/lib/utils";
import type { CoverArt } from "./data";

const GLASS = "rgb(var(--neon) / 0.2)";
const CORE = "color-mix(in srgb, rgb(var(--neon)) 45%, white)";

/** A bent tube: always-visible glass, plus a halo and a hot core that only show while lit. */
function Tube({ d, lit, width = 2, dashed }: { d: string; lit: boolean; width?: number; dashed?: boolean }) {
  const dash = dashed ? "2 7" : undefined;
  const fade = cn("transition-opacity duration-500", lit ? "opacity-100" : "opacity-0");
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={GLASS} strokeWidth={width + 1} strokeDasharray={dash} />
      <path d={d} stroke="rgb(var(--neon))" strokeWidth={width * 3} strokeDasharray={dash} className={cn(fade, "[filter:blur(4px)]")} />
      <path d={d} stroke={CORE} strokeWidth={width} strokeDasharray={dash} className={fade} />
    </g>
  );
}

function Dot({ x, y, r = 4, lit }: { x: number; y: number; r?: number; lit: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 2} fill="none" stroke={GLASS} />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={CORE}
        className={cn("transition-opacity duration-500", lit ? "opacity-100" : "opacity-0")}
        style={{ filter: "drop-shadow(0 0 4px rgb(var(--neon))) drop-shadow(0 0 10px rgb(var(--neon) / 0.6))" }}
      />
    </g>
  );
}

const label = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 9, letterSpacing: "0.14em" };

function Route({ lit }: { lit: boolean }) {
  const piers = [
    [46, 74],
    [128, 64],
    [214, 82],
    [300, 70],
    [92, 186],
    [184, 176],
    [272, 192],
    [352, 178],
  ];
  return (
    <>
      <path d="M0 96 C 80 84, 140 104, 220 98 S 340 86, 400 94" fill="none" stroke="rgb(255 255 255 / 0.1)" />
      <path d="M0 160 C 70 170, 150 150, 230 158 S 340 172, 400 162" fill="none" stroke="rgb(255 255 255 / 0.1)" />
      {[112, 126, 140].map((y, i) => (
        <path
          key={y}
          d={`M${10 + i * 14} ${y} h${60 - i * 8} M${140 + i * 10} ${y + 4} h${70 - i * 6} M${270 - i * 6} ${y - 2} h${80 - i * 10}`}
          stroke="rgb(255 255 255 / 0.06)"
          strokeLinecap="round"
        />
      ))}
      {piers.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#0b0c12" stroke="rgb(255 255 255 / 0.25)" />
      ))}
      <Tube d="M128 64 C 150 120, 200 136, 236 140 S 262 170, 272 192" lit={lit} dashed />
      <Dot x={128} y={64} lit={lit} />
      <Dot x={272} y={192} lit={lit} />
      <g transform="translate(222 132)">
        <rect x={-9} y={-5} width={18} height={10} rx={5} fill="#0b0c12" stroke={CORE} className={cn("transition-opacity duration-500", lit ? "opacity-100" : "opacity-40")} />
      </g>
      <text x={138} y={52} fill="rgb(255 255 255 / 0.55)" style={label}>
        KATENDRECHT
      </text>
      <text x={196} y={214} fill="rgb(255 255 255 / 0.55)" style={label}>
        ERASMUSBRUG · 4 MIN
      </text>
    </>
  );
}

function Tokens({ lit }: { lit: boolean }) {
  const cells = Array.from({ length: 18 }, (_, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const shapes = ["pill", "box", "toggle", "box", "pill", "dot"];
    return { x: 30 + col * 60, y: 46 + row * 56, shape: shapes[(i + row * 2) % shapes.length], index: i };
  });
  const litIndex = 8;
  return (
    <>
      {cells.map(({ x, y, shape, index }) => {
        const stroke = index === litIndex ? "transparent" : "rgb(255 255 255 / 0.16)";
        if (shape === "pill") return <rect key={index} x={x} y={y + 10} width={44} height={16} rx={8} fill="none" stroke={stroke} />;
        if (shape === "toggle")
          return (
            <g key={index}>
              <rect x={x + 8} y={y + 10} width={28} height={16} rx={8} fill="none" stroke={stroke} />
              <circle cx={x + 28} cy={y + 18} r={5} fill="rgb(255 255 255 / 0.18)" />
            </g>
          );
        if (shape === "dot") return <circle key={index} cx={x + 22} cy={y + 18} r={9} fill="none" stroke={stroke} />;
        return <rect key={index} x={x + 4} y={y} width={36} height={36} rx={7} fill="none" stroke={stroke} />;
      })}
      <Tube d="M158 128 h28 a8 8 0 0 0 0 -16 h-28 a8 8 0 0 0 0 16 z" lit={lit} width={1.8} />
      <Tube d="M172 128 V 147 H 262 V 222" lit={lit} width={1} dashed />
      <text x={270} y={226} fill="rgb(255 255 255 / 0.55)" style={label}>
        RADIUS.FULL
      </text>
      <text x={30} y={30} fill="rgb(255 255 255 / 0.55)" style={label}>
        46 / 46 COMPONENTS
      </text>
    </>
  );
}

function Wave({ lit }: { lit: boolean }) {
  const bars = Array.from({ length: 52 }, (_, i) => {
    // Deterministic, so server and client draw the same waveform.
    const h = 10 + Math.abs(Math.sin(i * 0.61) * 44 + Math.sin(i * 1.73) * 22 + Math.cos(i * 0.27) * 14);
    return { x: Math.round((30 + i * 6.6) * 10) / 10, h: Math.round(h) };
  });
  const playhead = 30 + 31 * 6.6;
  return (
    <>
      {bars.map(({ x, h }, i) => {
        const played = i < 31;
        return (
          <rect
            key={i}
            x={x}
            y={128 - h / 2}
            width={3}
            height={h}
            rx={1.5}
            fill={played && lit ? CORE : played ? GLASS : "rgb(255 255 255 / 0.12)"}
            className="transition-[fill] duration-500"
            style={played && lit ? { filter: "drop-shadow(0 0 3px rgb(var(--neon) / 0.8))" } : undefined}
          />
        );
      })}
      <Tube d={`M${playhead} 62 V 194`} lit={lit} width={1.4} />
      <text x={30} y={40} fill="rgb(255 255 255 / 0.55)" style={label}>
        ON AIR · 21:04
      </text>
      <text x={316} y={222} fill="rgb(255 255 255 / 0.55)" style={label}>
        0.6 S
      </text>
    </>
  );
}

function Type({ lit }: { lit: boolean }) {
  const lines = [
    [88, 230],
    [88, 250],
    [88, 214],
    [88, 246],
    [88, 238],
    [88, 160],
  ];
  return (
    <>
      <rect x={70} y={26} width={220} height={204} rx={6} fill="rgb(255 255 255 / 0.02)" stroke="rgb(255 255 255 / 0.1)" />
      <text x={88} y={70} fill="rgb(255 255 255 / 0.78)" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, letterSpacing: "-0.02em" }}>
        The long way
      </text>
      {lines.map(([x, w], i) => (
        <rect key={i} x={x} y={92 + i * 18} width={Math.min(w - x, 184)} height={5} rx={2.5} fill="rgb(255 255 255 / 0.14)" />
      ))}
      <Tube d="M88 154 H 240" lit={lit} width={1.6} />
      <Tube d="M318 40 V 214" lit={false} width={1} />
      <Tube d="M318 40 V 112" lit={lit} width={1.6} />
      <Dot x={318} y={112} r={3.5} lit={lit} />
      <text x={330} y={116} fill="rgb(255 255 255 / 0.55)" style={label}>
        41%
      </text>
    </>
  );
}

const arts = { route: Route, tokens: Tokens, wave: Wave, type: Type } as const;

/** The CSS/SVG artwork for a project, drawn in the accent. Lit parts go dark with the lights. */
export function Cover({ art, lit, className }: { art: CoverArt; lit: boolean; className?: string }) {
  const Art = arts[art];
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#07080d]",
        "bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:24px_24px]",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_55%_60%,rgb(var(--neon)/0.13),transparent_70%)] transition-opacity duration-500",
          lit ? "opacity-100" : "opacity-0",
        )}
      />
      <svg aria-hidden viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full">
        <Art lit={lit} />
      </svg>
    </div>
  );
}
