import { HologramCard } from "@/components/ui/hologram-card";

const stats = [
  { label: "Tubes", value: "412" },
  { label: "Volts", value: "9 kV" },
  { label: "Lit", value: "32 yrs" },
];

function Skyline() {
  return (
    <svg viewBox="0 0 240 150" className="block h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="kowloon-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0a1e" />
          <stop offset="0.75" style={{ stopColor: "rgb(var(--neon) / 0.45)" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--neon) / 0.7)" }} />
        </linearGradient>
        <linearGradient id="kowloon-street" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--neon) / 0.35)" }} />
          <stop offset="1" stopColor="#05060a" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" fill="url(#kowloon-sky)" />
      <circle cx="168" cy="38" r="15" fill="#fff" opacity="0.14" />
      <circle cx="168" cy="38" r="9" fill="#fff" opacity="0.5" />
      {/* Far blocks */}
      <path d="M0 96V58h22V44h18v52zM196 96V50h16V36h28v60z" fill="#1a1830" />
      {/* Near blocks with lit windows */}
      <path d="M0 150V70h46v80zM188 150V62h52v88z" fill="#0b0b14" />
      <g fill="#fff" opacity="0.35">
        <rect x="8" y="80" width="4" height="3" />
        <rect x="20" y="80" width="4" height="3" />
        <rect x="32" y="92" width="4" height="3" />
        <rect x="8" y="104" width="4" height="3" />
        <rect x="198" y="74" width="4" height="3" />
        <rect x="222" y="86" width="4" height="3" />
        <rect x="210" y="98" width="4" height="3" />
        <rect x="198" y="110" width="4" height="3" />
      </g>
      {/* Signs hung on brackets over the street */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g style={{ stroke: "rgb(var(--neon))" }} strokeWidth="3.2" opacity="0.55">
          <rect x="54" y="30" width="20" height="58" rx="3" />
          <rect x="150" y="66" width="30" height="20" rx="3" />
          <path d="M84 52h46M84 60h46" />
        </g>
        <g stroke="#fff" strokeWidth="1.1">
          <rect x="54" y="30" width="20" height="58" rx="3" />
          <rect x="150" y="66" width="30" height="20" rx="3" />
          <path d="M84 52h46M84 60h46" />
        </g>
        <path d="M46 40h8M46 80h8M180 70h8" stroke="#2a2a3a" strokeWidth="2" />
      </g>
      <rect y="118" width="240" height="32" fill="url(#kowloon-street)" />
    </svg>
  );
}

export default function HologramCardDemo() {
  return (
    <HologramCard className="aspect-[5/7] w-64 p-2.5">
      <div className="flex h-full flex-col rounded-[11px] border border-white/10 bg-[linear-gradient(180deg,#0d0e17,#07080d)] p-2.5">
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <h3
            className="text-[17px] leading-none text-white/95"
            style={{ fontFamily: "var(--font-tilt-neon)" }}
          >
            Kowloon Nights
          </h3>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--neon))]">Holo</span>
        </div>

        <div className="mt-2 aspect-[8/5] overflow-hidden rounded-md border border-white/10">
          <Skyline />
        </div>

        <p className="mt-2 flex justify-between px-0.5 text-[10px] font-medium text-white/55">
          <span>Signage, 1987</span>
          <span>Nathan Road</span>
        </p>

        <p className="mt-2 px-0.5 text-[11.5px] leading-[1.45] text-white/70">
          Eleven thousand tubes along one road, bent by hand and lit at dusk. Most went dark in 2019.
        </p>

        <dl className="mt-auto grid grid-cols-3 divide-x divide-white/10 rounded-md border border-white/10 bg-white/[0.03] py-1.5 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/50">{stat.label}</dt>
              <dd className="mt-0.5 text-[13px] font-semibold tabular-nums text-white/90">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-2 flex justify-between px-0.5 text-[9.5px] tabular-nums text-white/50">
          <span>Neon Archive, series 1</span>
          <span>07/24</span>
        </p>
      </div>
    </HologramCard>
  );
}
