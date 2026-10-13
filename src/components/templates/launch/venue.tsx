import { Bike, Plane, Ship, TrainFront } from "lucide-react";

import { event } from "./config";
import { travel, venueNotes } from "./data";

const ICONS = { metro: TrainFront, water: Ship, bike: Bike, train: Plane } as const;

const css = `
@keyframes nk-launch-ping { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(2.4); opacity: 0; } }
@keyframes nk-launch-walk { to { stroke-dashoffset: -24; } }
.nk-launch-ping { transform-box: fill-box; transform-origin: center; animation: nk-launch-ping 2.4s cubic-bezier(0.23, 1, 0.32, 1) infinite; }
.nk-launch-walk { animation: nk-launch-walk 1.6s linear infinite; }
@media (prefers-reduced-motion: reduce) { .nk-launch-ping, .nk-launch-walk { animation: none; } }
`;

const WATER = "M0 112C140 96 260 92 380 78S560 52 640 44V128C560 136 500 146 432 150H330C300 152 260 160 230 166L0 196Z";
const RIJNHAVEN = "M334 150L430 146L438 298C404 302 370 302 340 300Z";
const MAASHAVEN = "M92 192L226 168L232 318L398 314L404 392C300 398 190 400 98 398Z";

/** Katendrecht, drawn rather than tiled: the river, two harbour basins, the metro and the walk from it. */
function VenueMap() {
  return (
    <svg viewBox="0 0 640 480" role="img" aria-labelledby="venue-map-title" className="block h-auto w-full">
      <title id="venue-map-title">
        Map: the Wolfraamhal on the Katendrecht peninsula, six minutes on foot from Rijnhaven metro over the Rijnhavenbrug.
      </title>
      <defs>
        <pattern id="nk-launch-water" width="12" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3h6" stroke="rgb(255 255 255 / 0.06)" strokeWidth="1" />
        </pattern>
        <radialGradient id="nk-launch-spill">
          <stop offset="0" stopColor="rgb(var(--neon))" stopOpacity="0.35" />
          <stop offset="1" stopColor="rgb(var(--neon))" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="480" fill="#12131b" />

      {/* Streets, faint, then the water over them. */}
      <g stroke="rgb(255 255 255 / 0.075)" strokeWidth="1.2" fill="none">
        <path d="M0 40L640 4M0 70L640 28M120 0L104 100M260 0L250 90M400 0L392 76M560 0L556 50" />
        <path d="M240 200L326 190M240 236L326 230M240 272L326 268M240 306L326 304M276 176V316" />
        <path d="M440 170L640 160M440 210L640 204M440 250L640 246M440 300L640 296M440 350L640 348M500 150V480M590 140V480" />
        <path d="M0 420L640 430M0 456L640 466M160 400V480M300 400V480M420 300V480" />
      </g>

      <g fill="#060709">
        <path d={WATER} />
        <path d={RIJNHAVEN} />
        <path d={MAASHAVEN} />
      </g>
      <g fill="url(#nk-launch-water)">
        <path d={WATER} />
        <path d={RIJNHAVEN} />
        <path d={MAASHAVEN} />
      </g>
      <g stroke="rgb(255 255 255 / 0.14)" strokeWidth="1" fill="none">
        <path d={WATER} />
        <path d={RIJNHAVEN} />
        <path d={MAASHAVEN} />
      </g>

      {/* Erasmusbrug and the Rijnhavenbrug. */}
      <path d="M492 140L470 62" stroke="rgb(255 255 255 / 0.35)" strokeWidth="3" strokeLinecap="round" />
      <path d="M326 236H436" stroke="rgb(255 255 255 / 0.3)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Metro D and E, in a tunnel under the river. */}
      <path d="M548 0L522 140L476 252L454 480" stroke="rgb(255 255 255 / 0.32)" strokeWidth="2" strokeDasharray="7 5" fill="none" />
      <circle cx="476" cy="252" r="6.5" fill="#0b0c12" stroke="rgb(255 255 255 / 0.75)" strokeWidth="2" />

      {/* The walk, lit. */}
      <path
        d="M470 248C452 240 440 236 430 236H326C312 236 300 238 290 242"
        fill="none"
        stroke="color-mix(in srgb, rgb(var(--neon)) 40%, white)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 6"
        className="nk-launch-walk"
        style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon)))" }}
      />

      <circle cx="284" cy="244" r="80" fill="url(#nk-launch-spill)" />
      <circle cx="284" cy="244" r="10" fill="rgb(var(--neon))" opacity="0.45" className="nk-launch-ping" />
      <circle
        cx="284"
        cy="244"
        r="7"
        fill="color-mix(in srgb, rgb(var(--neon)) 35%, white)"
        style={{ filter: "drop-shadow(0 0 4px rgb(var(--neon))) drop-shadow(0 0 12px rgb(var(--neon)))" }}
      />

      <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="11" letterSpacing="1.6">
        <text x="252" y="214" fill="rgb(255 255 255 / 0.92)" fontSize="12.5">
          WOLFRAAMHAL
        </text>
        <text x="372" y="226" fill="color-mix(in srgb, rgb(var(--neon)) 50%, white)" fontSize="10.5">
          6 MIN
        </text>
        <text x="490" y="276" fill="rgb(255 255 255 / 0.8)">
          RIJNHAVEN M
        </text>
        <text x="40" y="150" fill="rgb(255 255 255 / 0.5)" fontStyle="italic" letterSpacing="3">
          NIEUWE MAAS
        </text>
        <text x="350" y="284" fill="rgb(255 255 255 / 0.45)" fontSize="9.5">
          RIJNHAVEN
        </text>
        <text x="110" y="376" fill="rgb(255 255 255 / 0.45)" fontSize="9.5">
          MAASHAVEN
        </text>
        <text x="246" y="296" fill="rgb(255 255 255 / 0.55)" fontSize="9.5">
          KATENDRECHT
        </text>
        <text x="456" y="72" textAnchor="end" fill="rgb(255 255 255 / 0.5)" fontSize="9.5">
          ERASMUSBRUG
        </text>
        <text x="560" y="24" fill="rgb(255 255 255 / 0.55)" fontSize="9.5">
          CENTRAAL ↑
        </text>
      </g>
    </svg>
  );
}

export function Venue() {
  return (
    <section id="venue" aria-labelledby="venue-title" className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-8 lg:py-32">
      <style>{css}</style>
      <div className="mx-auto max-w-[1176px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">Venue and travel</p>
            <h2
              id="venue-title"
              className="mt-6 max-w-[14ch] text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white"
            >
              An old filament factory on the Maas.
            </h2>
            <p className="mt-6 max-w-[46ch] text-pretty text-[15px] leading-relaxed text-white/65">
              The {event.venue} made light bulbs until 1971. The hall still has its gantry cranes and a north-light roof,
              and after dark it&apos;s the best room in Rotterdam for looking at a screen.
            </p>
            <address className="mt-8 border-t border-white/[0.07] pt-6 not-italic">
              <p className="text-[15px] font-medium text-white">{event.venue}</p>
              <p className="mt-1 text-[15px] text-white/65">{event.address}</p>
            </address>
          </div>

          <figure className="relative self-start lg:pt-2">
            <div className="overflow-hidden rounded-[20px] border border-white/10 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
              <VenueMap />
            </div>
            <figcaption className="mt-3 flex justify-between gap-4 px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
              <span>51.903° N, 4.483° E</span>
              <span>Not to scale</span>
            </figcaption>
          </figure>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {travel.map((item) => {
            const Icon = ICONS[item.id as keyof typeof ICONS];
            return (
              <li key={item.id} className="bg-[#05060a] p-5 sm:p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
                  <Icon aria-hidden className="size-3.5" strokeWidth={1.75} />
                  {item.mode}
                </p>
                <p className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">{item.time}</p>
                <p className="mt-3 text-pretty text-[14px] leading-relaxed text-white/65">{item.route}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
          <ul className="grid gap-2.5">
            {venueNotes.map((note) => (
              <li key={note} className="flex gap-3 text-[14px] leading-relaxed text-white/70">
                <span aria-hidden className="mt-[0.68em] h-[2px] w-3 shrink-0 rounded-full bg-[rgb(var(--neon)/0.7)]" />
                {note}
              </li>
            ))}
          </ul>
          <p className="max-w-[60ch] text-pretty text-[14px] leading-relaxed text-white/65">
            <span className="text-white/90">Staying over?</span> We hold 60 rooms at Hotel Nachtwacht on the Deliplein, four
            minutes from the door: €119 a night with the code <span className="font-mono text-white/85">LOWLIGHT27</span> until
            1 March.
          </p>
        </div>
      </div>
    </section>
  );
}
