import { NeonFrame } from "@/components/ui/neon-frame";

// A night feed, drawn flat and desaturated like a CCTV sensor sees it.
function DockScene() {
  const floor = [-60, -20, 20, 60, 100, 140, 180, 220];
  return (
    <svg aria-hidden viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <defs>
        <radialGradient id="dock-lamp" cx="0.29" cy="0.12" r="0.45">
          <stop offset="0" stopColor="#d9c9a0" stopOpacity="0.32" />
          <stop offset="1" stopColor="#d9c9a0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dock-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141b23" />
          <stop offset="1" stopColor="#0b0f14" />
        </linearGradient>
        <radialGradient id="dock-vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="160" height="62" fill="#10161d" />
      <rect y="62" width="160" height="28" fill="url(#dock-floor)" />
      {/* Floor joints running back to the door */}
      <g stroke="#26313d" strokeWidth="0.35">
        {floor.map((x) => (
          <line key={x} x1={x} y1="90" x2={46 + (x - 46) * 0.12} y2="62" />
        ))}
        <line x1="0" y1="70" x2="160" y2="70" />
        <line x1="0" y1="80" x2="160" y2="80" />
      </g>
      {/* Roller door, half open, and the lamp over it */}
      <rect x="22" y="18" width="48" height="44" fill="#151c24" stroke="#2a3542" strokeWidth="0.5" />
      <g stroke="#222c37" strokeWidth="0.45">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="22" y1={20 + i * 3} x2="70" y2={20 + i * 3} />
        ))}
      </g>
      <rect x="22.25" y="47" width="47.5" height="15" fill="#06080b" />
      <rect x="40" y="13" width="12" height="2.2" rx="1" fill="#e8dcb8" opacity="0.85" />
      <rect width="160" height="90" fill="url(#dock-lamp)" />
      {/* Pallets by the door */}
      <g fill="#1c2530" stroke="#2c3946" strokeWidth="0.4">
        <rect x="6" y="56" width="13" height="8" />
        <rect x="6" y="48" width="13" height="8" />
        <rect x="8" y="64" width="13" height="8" />
      </g>
      {/* Forklift, side on, forks toward the door */}
      <g stroke="#3a4957" strokeWidth="0.6" strokeLinejoin="round">
        <path d="M96 30v44M99 30v44" />
        <path d="M86 73.5h12" strokeWidth="1.2" />
        <rect x="87" y="66" width="10" height="6.5" fill="#1f2a35" />
        <path d="M103 52l2-15h17l2 15" fill="none" />
        <path d="M100 52h26a2 2 0 0 1 2 2v14h-28z" fill="#232f3b" />
        <path d="M122 52h6v16h-6z" fill="#2b3845" />
        <circle cx="105" cy="74" r="5" fill="#0d1218" />
        <circle cx="122" cy="74" r="5" fill="#0d1218" />
        <circle cx="105" cy="74" r="1.6" fill="#3a4957" stroke="none" />
        <circle cx="122" cy="74" r="1.6" fill="#3a4957" stroke="none" />
      </g>
      <rect x="114" y="36.3" width="5" height="1.2" fill="#e6a23c" opacity="0.8" />
      <rect width="160" height="90" fill="url(#dock-vignette)" />
    </svg>
  );
}

export default function NeonFrameCamera() {
  return (
    <NeonFrame
      as="figure"
      label="Cam 03, loading dock"
      tabs={{
        topRight: (
          <>
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-[rgb(255_77_94)] shadow-[0_0_6px_rgb(255_77_94)]" />
            Rec
          </>
        ),
        bottomLeft: <span className="font-mono tabular-nums">2026-10-10 23:41:07</span>,
        bottomRight: "1080p · 24 fps",
      }}
      className="w-full max-w-xl p-2"
    >
      <div className="relative aspect-video overflow-hidden bg-[#07090d]">
        <DockScene />

        <NeonFrame
          color="amber"
          active
          bracket={8}
          tabs={{ bottomLeft: "Forklift 92%" }}
          className="absolute left-[53%] top-[33%] h-[56%] w-[30%] border-transparent bg-transparent p-0"
          aria-label="Detected: forklift, 92% confidence"
        />
      </div>
      <figcaption className="sr-only">Camera 3, loading dock, recording. One forklift detected.</figcaption>
    </NeonFrame>
  );
}
