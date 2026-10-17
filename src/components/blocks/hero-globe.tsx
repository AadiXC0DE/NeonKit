"use client";

import * as React from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Globe, type GlobeArc, type GlobeMarker } from "@/components/ui/globe";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const COMMAND = "npx meridian deploy";

// 18 of the 41 regions, at their airports. Region names follow the nearest airport code.
const REGIONS: GlobeMarker[] = [
  { id: "sfo1", label: "sfo1", lat: 37.62, lng: -122.38 },
  { id: "iad1", label: "iad1", lat: 38.95, lng: -77.45 },
  { id: "yul1", label: "yul1", lat: 45.47, lng: -73.74 },
  { id: "gru1", label: "gru1", lat: -23.43, lng: -46.47 },
  { id: "scl1", label: "scl1", lat: -33.39, lng: -70.79 },
  { id: "lhr1", label: "lhr1", lat: 51.47, lng: -0.45 },
  { id: "fra1", label: "fra1", lat: 50.03, lng: 8.57 },
  { id: "arn1", label: "arn1", lat: 59.65, lng: 17.92 },
  { id: "mad1", label: "mad1", lat: 40.47, lng: -3.56 },
  { id: "los1", label: "los1", lat: 6.58, lng: 3.32 },
  { id: "jnb1", label: "jnb1", lat: -26.14, lng: 28.24 },
  { id: "dxb1", label: "dxb1", lat: 25.25, lng: 55.36 },
  { id: "bom1", label: "bom1", lat: 19.09, lng: 72.87 },
  { id: "sin1", label: "sin1", lat: 1.36, lng: 103.99 },
  { id: "hkg1", label: "hkg1", lat: 22.31, lng: 113.91 },
  { id: "icn1", label: "icn1", lat: 37.46, lng: 126.44 },
  { id: "hnd1", label: "hnd1", lat: 35.55, lng: 139.78 },
  { id: "syd1", label: "syd1", lat: -33.94, lng: 151.18 },
];

// A deploy builds once in fra1, then lands everywhere else.
const FANOUT: GlobeArc[] = ["iad1", "gru1", "los1", "jnb1", "bom1", "sin1", "arn1"].map((to) => ({ from: "fra1", to }));

// p95 round trip from real users to the region that answered them. `base` is the reading it hovers around.
const READOUT = [
  { region: "fra1", city: "Frankfurt", base: 11 },
  { region: "iad1", city: "Washington", base: 9 },
  { region: "gru1", city: "São Paulo", base: 21 },
  { region: "bom1", city: "Mumbai", base: 26 },
  { region: "sin1", city: "Singapore", base: 16 },
];

const FACTS = [
  { value: "41", label: "regions" },
  { value: "9 s", label: "to reach all of them" },
  { value: "$0.40", label: "per million requests" },
];

/** The latency panel. It ticks every 1.4 s, so its state lives here and nothing else re-renders. */
function Readout({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [values, setValues] = React.useState(() => READOUT.map((row) => row.base));

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    let inView = false;
    const sync = () => {
      const run = inView && !document.hidden;
      if (run && !timer) {
        timer = setInterval(() => {
          setValues(READOUT.map((row) => Math.max(3, row.base + Math.round(Math.random() * 4 - 1.6))));
        }, 1400);
      } else if (!run && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (timer) clearInterval(timer);
    };
  }, []);

  const worst = Math.max(...values);
  const fastest = values.indexOf(Math.min(...values));

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[14px] border border-white/[0.08] bg-[#07090d]/85 px-5 pb-4 pt-4 backdrop-blur-[10px]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-6">
        <p className="text-[13px] leading-snug text-white/60">p95 round trip, last 60 s</p>
        <span className="flex items-center gap-2 text-[13px] text-white/60">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_0_2px_rgb(var(--neon)/0.15),0_0_8px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1)))]"
          />
          Live
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-2 font-mono tabular-nums">
        <span className="text-[44px] leading-none tracking-[-0.04em] text-white">{worst}</span>
        <span className="font-sans text-[14px] text-white/55">ms in the slowest region</span>
      </p>
      <table className="mt-4 w-full border-t border-white/[0.07] text-[13px]">
        <caption className="sr-only">p95 round trip by region, in milliseconds</caption>
        <tbody>
          {READOUT.map((row, i) => (
            <tr key={row.region} className="border-b border-white/[0.05] last:border-0">
              <th scope="row" className="py-[7px] pr-4 text-left font-normal text-white/75">
                {row.city}
              </th>
              <td className="py-[7px] pr-4 font-mono text-[12.5px] text-white/50">{row.region}</td>
              <td
                className={cn(
                  "py-[7px] text-right font-mono tabular-nums transition-colors duration-300",
                  i === fastest ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))]" : "text-white/85",
                )}
              >
                {values[i]} ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HeroGlobe() {
  return (
    <section
      aria-labelledby="meridian-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("green")}
      className="relative isolate overflow-hidden bg-[#05060a] text-white"
    >
      {/* Light from the planet falling across the right of the page. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_82%_55%,rgb(var(--neon)/0.07),transparent_70%)]"
      />

      <header className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <span className="text-[19px] font-semibold tracking-[-0.04em] text-white/90">meridian</span>
        <nav aria-label="Main" className="flex items-center gap-7 text-[14px] text-white/60">
          <a href="#" className="hidden transition-colors hover:text-white sm:inline">
            Docs
          </a>
          <a href="#" className="hidden transition-colors hover:text-white sm:inline">
            Pricing
          </a>
          <a href="#" className="hidden transition-colors hover:text-white md:inline">
            Status
          </a>
          <a href="#" className="text-white/85 transition-colors hover:text-white">
            Sign in
          </a>
        </nav>
      </header>

      <div className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:min-h-[780px]">
        <div className="relative z-10 pt-12 sm:pt-16 lg:flex lg:min-h-[780px] lg:w-[54%] lg:flex-col lg:pt-24 xl:w-[50%]">
          <h1
            id="meridian-hero-title"
            className="text-[clamp(3rem,7.4vw,5.5rem)] font-[620] leading-[0.94] tracking-[-0.048em] text-white [font-stretch:112%]"
          >
            Within 30&nbsp;ms
            <br />
            of everyone.
          </h1>
          <p className="mt-7 max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-white/60">
            <span className="text-white/90">Meridian runs your functions in 41 regions</span> and answers each request
            from the closest one with room to spare. One command ships to all of them in about nine seconds.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="solid" size="lg">
              <a href="#">
                Start deploying <ArrowRight />
              </a>
            </Button>
            <div className="flex h-12 items-center gap-1 rounded-xl border border-white/[0.09] bg-[#0a0c12]/80 pl-4 pr-1.5">
              <code className="flex-1 font-mono text-[13.5px] text-white/80">
                <span className="select-none text-white/40">$ </span>
                {COMMAND}
              </code>
              <CopyButton value={COMMAND} aria-label={`Copy: ${COMMAND}`} />
            </div>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-white/55 lg:mt-auto lg:pb-14">
            {FACTS.map((fact) => (
              <div key={fact.label} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{fact.label}</dt>
                <dd className="font-medium text-white/90">{fact.value}</dd>
                <dd aria-hidden>{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* One planet. Phones and tablets: its top rises under the copy, cut off below. Desktop: it hangs off the
            right edge and the readout sits on its shoulder. */}
        <div className="relative -mx-5 mt-6 h-[min(116vw,600px)] overflow-hidden [mask-image:linear-gradient(#000_55%,transparent)] sm:-mx-8 lg:absolute lg:inset-y-0 lg:right-0 lg:m-0 lg:h-auto lg:w-[62%] lg:overflow-visible lg:[mask-image:none]">
          <Globe
            markers={REGIONS}
            arcs={FANOUT}
            longitude={-8}
            tilt={26}
            speed={4}
            className="absolute left-1/2 top-0 w-[min(150vw,860px)] max-w-none -translate-x-1/2 lg:left-auto lg:right-[-21%] lg:top-1/2 lg:w-[min(64vw,880px)] lg:translate-x-0 lg:-translate-y-1/2"
          />
        </div>

        <Readout className="relative z-10 -mt-20 mb-10 sm:-mt-28 sm:mx-auto sm:max-w-[400px] lg:absolute lg:bottom-14 lg:right-8 lg:m-0 lg:w-[340px]" />
      </div>
    </section>
  );
}
