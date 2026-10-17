import { Globe, type GlobeArc, type GlobeMarker } from "@/components/ui/globe";

const regions: (GlobeMarker & { city: string; ms: number | null })[] = [
  { id: "iad1", label: "iad1", city: "Washington, D.C.", lat: 38.95, lng: -77.45, ms: 9 },
  { id: "sfo1", label: "sfo1", city: "San Francisco", lat: 37.62, lng: -122.38, ms: 14 },
  { id: "gru1", label: "gru1", city: "São Paulo", lat: -23.43, lng: -46.47, ms: 21 },
  { id: "fra1", label: "fra1", city: "Frankfurt", lat: 50.03, lng: 8.57, ms: 12 },
  { id: "lhr1", label: "lhr1", city: "London", lat: 51.47, lng: -0.45, ms: 11 },
  { id: "bom1", label: "bom1", city: "Mumbai", lat: 19.09, lng: 72.87, ms: 26 },
  { id: "sin1", label: "sin1", city: "Singapore", lat: 1.36, lng: 103.99, ms: 17 },
  { id: "hnd1", label: "hnd1", city: "Tokyo", lat: 35.55, lng: 139.78, ms: 15 },
  { id: "syd1", label: "syd1", city: "Sydney", lat: -33.94, lng: 151.18, ms: 19 },
  { id: "cpt1", label: "cpt1", city: "Cape Town", lat: -33.97, lng: 18.6, ms: null, live: false },
];

// Writes land in iad1 and fan out to the read replicas.
const replication: GlobeArc[] = ["sfo1", "gru1", "fra1", "bom1", "sin1", "hnd1"].map((to) => ({ from: "iad1", to }));

const listed = ["iad1", "fra1", "sin1", "cpt1"];

export default function GlobeDemo() {
  return (
    <div className="grid w-full max-w-3xl items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
      <div className="order-2 sm:order-1">
        <p className="text-[13px] text-white/55">Median time to first byte, last 24 h</p>
        <p className="mt-1 font-mono text-5xl tabular-nums tracking-tight text-white/90">
          14<span className="ml-1 text-2xl text-white/55">ms</span>
        </p>
        <ul className="mt-6 divide-y divide-white/[0.06] border-y border-white/[0.06] text-sm">
          {regions
            .filter((r) => listed.includes(r.id as string))
            .map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden
                  className={
                    r.live === false
                      ? "size-1.5 rounded-full bg-white/20"
                      : "size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]"
                  }
                />
                <span className="text-white/85">{r.city}</span>
                <span className="ml-auto font-mono text-xs tabular-nums text-white/55">
                  {r.ms === null ? "draining" : `${r.id} · ${r.ms} ms`}
                </span>
              </li>
            ))}
        </ul>
        <p className="mt-4 text-[13px] leading-relaxed text-white/55">
          Writes commit in iad1 and reach six replicas in under 140 ms. Drag the globe to look around.
        </p>
      </div>
      <Globe
        markers={regions}
        arcs={replication}
        longitude={-40}
        tilt={24}
        className="order-1 mx-auto max-w-[460px] sm:order-2"
      />
    </div>
  );
}
