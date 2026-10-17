import { ArrowLeft, Search } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NeonSign } from "@/components/ui/neon-sign";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const HOME = "/";
const REQUESTED = "/stays/big-sur-cabin-12";
const REF = "7c1e-04b9";
const KEYS = [
  { room: "101", label: "Stays near you", href: "#stays", tilt: "-rotate-[4deg]" },
  { room: "102", label: "Last-minute deals", href: "#deals", tilt: "rotate-[2deg]" },
  { room: "103", label: "Your trips", href: "#trips", tilt: "-rotate-[1.5deg]" },
  { room: "104", label: "Help desk", href: "#help", tilt: "rotate-[3.5deg]" },
];

// Motel key fobs on a rail. They swing straight and light up when picked.
function KeyFob({ room, label, href, tilt }: (typeof KEYS)[number]) {
  return (
    <li className="flex flex-col items-center">
      <span aria-hidden className="h-3 w-px bg-white/25" />
      <a
        href={href}
        className={cn(
          "group relative flex w-full origin-top flex-col items-center rounded-b-[22px] rounded-t-[12px] border border-white/10 bg-white/[0.03] px-2 pb-4 pt-3 outline-none",
          "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          "hover:rotate-0 hover:border-[rgb(var(--neon)/0.6)] hover:bg-[rgb(var(--neon)/0.06)] hover:shadow-[0_0_24px_-6px_rgb(var(--neon)/0.6)]",
          "focus-visible:rotate-0 focus-visible:border-[rgb(var(--neon)/0.6)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          tilt,
        )}
      >
        <span aria-hidden className="size-2.5 rounded-full border border-white/20 bg-[#05060a]" />
        <span className="mt-2 text-[24px] font-[620] tabular-nums tracking-[-0.03em] text-white/80 [font-stretch:112%] transition-[color,text-shadow] duration-300 group-hover:text-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] group-hover:[text-shadow:0_0_8px_rgb(var(--neon)),0_0_20px_rgb(var(--neon)/0.6)] group-focus-visible:text-[color-mix(in_srgb,rgb(var(--neon))_35%,white)]">
          {room}
        </span>
        <span className="mt-1 text-center text-[12px] leading-tight text-white/60 group-hover:text-white/85">{label}</span>
      </a>
    </li>
  );
}

export default function Marketing404() {
  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("red")}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#05060a] px-5 py-6 text-white/90 sm:px-10 lg:min-h-[max(780px,100svh)]"
    >
      {/* Painted siding the sign throws its light across */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[repeating-linear-gradient(180deg,transparent_0_31px,rgb(255_255_255/0.025)_31px_32px)] [mask-image:radial-gradient(ellipse_80%_70%_at_70%_35%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="absolute right-[-10%] top-[-10%] -z-10 h-[80%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.14),transparent)] lg:right-[-5%] lg:w-[60%]"
      />

      <header className="flex items-center justify-between">
        <a
          href={HOME}
          className="-my-1.5 rounded-md py-1.5 text-[17px] font-semibold tracking-[-0.02em] text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          wayside<span className="text-[rgb(var(--neon))]">.</span>
        </a>
        <span className="text-[13px] text-white/55">Roadside stays since 2014</span>
      </header>

      <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-16">
        <div className="flex justify-center lg:order-2">
          <NeonSign
            aria-hidden
            size="xl"
            frame="rounded"
            cable="bottom"
            flicker="dying"
            dyingLetter={1}
            lines={[
              { text: "404", className: "text-[1.3em] leading-[1.02] tracking-[0.02em]" },
              { text: "NO VACANCY", className: "text-[0.44em] tracking-[0.18em]" },
            ]}
            style={{ fontFamily: "var(--font-tilt-neon, inherit)", fontSize: "clamp(52px, 13vw, 116px)" }}
          />
        </div>

        <div className="max-w-[540px]">
          <h1 className="text-[clamp(2.75rem,6.4vw,5.25rem)] font-[620] leading-[0.96] tracking-[-0.04em] [font-stretch:112%]">
            We checked every floor.
          </h1>
          <p className="mt-7 max-w-[44ch] text-[17px] leading-[1.6] text-white/60">
            This page checked out, or it never checked in. The link might be old, or typed from memory on the
            road. Grab a key from the front desk instead.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="solid" size="lg">
              <a href={HOME}>
                <ArrowLeft /> Back to the lobby
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="border border-white/10">
              <a href="#search">
                <Search /> Search stays
              </a>
            </Button>
          </div>

          <nav aria-label="Popular pages" className="mt-12">
            <div aria-hidden className="relative h-px bg-[linear-gradient(90deg,rgb(255_255_255/0.18),rgb(255_255_255/0.06))]" />
            <ul className="grid grid-cols-4 gap-3 sm:gap-4">
              {KEYS.map((key) => (
                <KeyFob key={key.room} {...key} />
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/[0.06] pt-5 text-[13px] text-white/55">
        <code className="font-mono text-[12px] [overflow-wrap:anywhere]">
          GET {REQUESTED} <span className="text-[rgb(var(--neon))]">→ 404</span>
        </code>
        <span>
          Quote <span className="font-mono text-[12px] text-white/70">{REF}</span> if you call the front desk.
        </span>
      </footer>
    </section>
  );
}
