import { Shuffle } from "@/components/ui/icons";

// Shuffle, measured from its path: the lower run is in front, the upper run stops a blockout short of it.
const cap = [8.04, 8.85]; // end of the tube that passes behind
const normal = [0.8792, 0.4763]; // unit normal of the front tube, pointing away from that end
const at = (d: number) => `${cap[0] + normal[0] * d} ${cap[1] + normal[1] * d}`;

const notes = [
  {
    value: "1.75",
    title: "Tube",
    body: "The default stroke, in viewBox units. A touch under lucide's 2, so a lit icon has room for its halo.",
  },
  {
    value: "r3",
    title: "Bend",
    body: "Every corner is an arc in the path: radius 3 on structure, 1.5 to 2 on small parts like the arrowheads. Nothing leans on stroke-linejoin.",
  },
  {
    value: "1.25",
    title: "Blockout",
    body: "A tube that passes behind another stops 3 units from the front tube's centre line, leaving 1.25 of dark between the glass. Sign makers paint that out by hand. Here it's missing path, so it holds on any background.",
  },
];

export default function IconsAnatomy() {
  return (
    <div className="@container w-full max-w-[42rem]">
      <div className="grid w-full items-center gap-10 @xl:grid-cols-[minmax(0,1fr)_15rem] @xl:gap-12">
        <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
          {/* 24-unit grid, the plate the glyph is drawn on */}
          <svg viewBox="0 0 24 24" aria-hidden className="absolute inset-0 size-full" fill="none" stroke="white">
            <path
              d={Array.from({ length: 23 }, (_, i) => `M${i + 1} 0V24M0 ${i + 1}H24`).join("")}
              strokeOpacity={0.05}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <rect width={24} height={24} strokeOpacity={0.12} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>

          {/* The glyph lit as a tube: halo, glass, white-hot core */}
          <Shuffle
            aria-hidden
            strokeWidth={2.5}
            className="absolute inset-0 size-full text-[rgb(var(--neon))] opacity-60 [filter:blur(10px)]"
          />
          <Shuffle
            aria-hidden
            className="absolute inset-0 size-full text-[rgb(var(--neon))] [filter:drop-shadow(0_0_3px_rgb(var(--neon)/0.9))]"
          />
          <Shuffle aria-hidden strokeWidth={0.5} className="absolute inset-0 size-full text-white/90" />

          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="absolute inset-0 size-full overflow-visible"
            fill="none"
            stroke="white"
          >
            {/* Hidden tube through the blockout */}
            <path
              d="M8.04 8.85L11.46 15.15"
              strokeOpacity={0.55}
              strokeWidth={1}
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
            {/* 1.25: from the cap's edge to the front tube's edge, square to the front tube */}
            <path
              d={`M${at(0.875)}L${at(2.125)}`}
              strokeOpacity={0.9}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={`M${at(0.875)}m-0.24 0.44l0.48 -0.88M${at(2.125)}m-0.24 0.44l0.48 -0.88`}
              strokeOpacity={0.9}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={cap[0]}
              cy={cap[1]}
              r={0.3}
              fill="#07080d"
              strokeOpacity={0.9}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={11.46}
              cy={15.15}
              r={0.3}
              fill="#07080d"
              strokeOpacity={0.9}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />

            {/* r3: the bend's circle, centre and radius */}
            <circle
              cx={4.71}
              cy={15}
              r={3}
              strokeOpacity={0.45}
              strokeWidth={1}
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M4.71 15L6.25 17.58M4.36 15h0.7M4.71 14.65v0.7"
              strokeOpacity={0.8}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />

            {/* 1.75: across the glass */}
            <path
              d="M15.75 5.125V6.875M15.35 5.125h0.8M15.35 6.875h0.8M15.75 5.125V3.9"
              strokeOpacity={0.9}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Values sit on the drawing, the way a dimensioned drawing labels itself */}
          {[
            { value: "1.75", x: 15.75, y: 3.2, align: "-translate-x-1/2" },
            { value: "r3", x: 4.71, y: 20.3, align: "-translate-x-1/2" },
            { value: "1.25", x: 8.1, y: 11.1, align: "-translate-x-full" },
          ].map(({ value, x, y, align }) => (
            <span
              key={value}
              aria-hidden
              style={{ left: `${(x / 24) * 100}%`, top: `${(y / 24) * 100}%` }}
              className={`absolute -translate-y-1/2 ${align} font-mono text-[11.5px] leading-none text-white/90`}
            >
              {value}
            </span>
          ))}
        </div>

        <dl className="grid gap-6">
          {notes.map((note) => (
            <div key={note.value}>
              <dt className="flex items-baseline gap-2.5 text-[15px] font-medium text-white/90">
                <span className="font-mono text-[13px] font-normal text-[rgb(var(--neon))]">{note.value}</span>
                {note.title}
              </dt>
              <dd className="mt-1.5 text-[14px] leading-[1.6] text-white/60">{note.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
