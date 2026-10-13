import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { neonVars } from "@/lib/neon";

type Customer = { name: string; meta: string; mark: React.ReactNode };

// Wordmarks are type plus a few SVG primitives, drawn in currentColor so the
// same artwork serves the resting and the lit layer.
const customers: Customer[] = [
  {
    name: "Halvard & Co.",
    meta: "Shipping · 340 seats",
    mark: (
      <span className="font-serif text-[23px] italic tracking-[-0.01em]">
        Halvard <span className="text-[0.82em]">&amp;</span> Co.
      </span>
    ),
  },
  {
    name: "Okapi Freight",
    meta: "Logistics · 1,120 seats",
    mark: <span className="font-mono text-[12px] font-medium uppercase tracking-[0.34em]">Okapi Freight</span>,
  },
  {
    name: "saltmarsh",
    meta: "Climate data · 64 seats",
    mark: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden>
          <circle cx="6" cy="6" r="6" fill="currentColor" />
        </svg>
        <span className="text-[22px] font-semibold tracking-[-0.045em]">saltmarsh</span>
      </span>
    ),
  },
  {
    name: "Verso Rail",
    meta: "Transit · 2,300 seats",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 20 16" className="h-4 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M5 15 9 1M11 15l4-14" />
        </svg>
        <span className="text-[19px] uppercase tracking-[0.02em]">
          <span className="font-extrabold">Verso</span>
          <span className="font-light">rail</span>
        </span>
      </span>
    ),
  },
  {
    name: "quillon",
    meta: "Legal tech · 48 seats",
    mark: <span className="font-mono text-[19px] tracking-[-0.02em]">quillon_</span>,
  },
  {
    name: "Marrow",
    meta: "Biotech · 210 seats",
    mark: <span className="font-serif text-[15px] uppercase tracking-[0.34em]">Marrow</span>,
  },
  {
    name: "tessel",
    meta: "CAD tooling · 96 seats",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 14 14" className="size-[14px]" aria-hidden>
          <rect x="0" y="0" width="6" height="6" fill="currentColor" />
          <rect x="8" y="0" width="6" height="6" fill="currentColor" />
          <rect x="0" y="8" width="6" height="6" fill="currentColor" />
          <rect x="8.75" y="8.75" width="4.5" height="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-[21px] font-medium tracking-[-0.035em]">tessel</span>
      </span>
    ),
  },
  {
    name: "Coldharbour",
    meta: "Cold storage · 410 seats",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 8a7 7 0 0 0 14 0Z" fill="currentColor" />
        </svg>
        <span className="font-serif text-[20px] tracking-[-0.01em]">Coldharbour</span>
      </span>
    ),
  },
  {
    name: "Arkline",
    meta: "Insurance · 780 seats",
    mark: (
      <span className="flex flex-col items-center">
        <svg viewBox="0 0 40 8" className="-mb-0.5 h-2 w-10" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 7C10 1 30 1 38 7" />
        </svg>
        <span className="text-[23px] font-black italic tracking-[-0.055em]">Arkline</span>
      </span>
    ),
  },
  {
    name: "Pellucid",
    meta: "Optics · 152 seats",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="6" cy="8" r="5" />
          <circle cx="10" cy="8" r="5" />
        </svg>
        <span className="text-[22px] font-extralight tracking-[0.01em]">Pellucid</span>
      </span>
    ),
  },
  {
    name: "Brickyard",
    meta: "Construction · 530 seats",
    mark: (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 16 12" className="h-3 w-4" aria-hidden fill="currentColor">
          <rect x="0" y="0" width="9" height="5" />
          <rect x="10.5" y="0" width="5.5" height="5" />
          <rect x="0" y="6.5" width="4" height="5" />
          <rect x="5.5" y="6.5" width="10.5" height="5" />
        </svg>
        <span className="text-[14px] font-bold uppercase tracking-[0.14em]">Brickyard</span>
      </span>
    ),
  },
  {
    name: "Plinth",
    meta: "Museums · 37 seats",
    mark: (
      <span className="border-[1.5px] border-current px-2.5 py-1 text-[12px] font-bold uppercase leading-none tracking-[0.3em]">
        Plinth
      </span>
    ),
  },
];

const css = `
.nk-logos-grid-lit { opacity: 0; transition: opacity 0.45s ease-out; }
.nk-logos-grid-cell:hover .nk-logos-grid-lit,
.nk-logos-grid-cell:focus-visible .nk-logos-grid-lit { opacity: 1; animation: nk-logos-grid-on 0.8s linear both; }
@keyframes nk-logos-grid-on {
  0% { opacity: 0 } 8% { opacity: 0.85 } 13% { opacity: 0.08 } 24% { opacity: 0.7 } 30% { opacity: 0.2 } 50%, 100% { opacity: 1 }
}
@media (prefers-reduced-motion: reduce) {
  .nk-logos-grid-lit { transition: none; }
  .nk-logos-grid-cell:hover .nk-logos-grid-lit,
  .nk-logos-grid-cell:focus-visible .nk-logos-grid-lit { animation: none; }
}
`;

function Tick({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute size-[9px] ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
    </span>
  );
}

function Cell({ customer }: { customer: Customer }) {
  return (
    <li className="border-b border-r border-white/[0.07]">
      <a
        href="#"
        aria-label={`${customer.name} customer story`}
        className="nk-logos-grid-cell group relative flex h-24 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)] sm:h-36"
      >
        {/* The light a lit sign throws on the panel behind it */}
        <span
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_50%_50%,rgb(var(--neon)/0.075),transparent_72%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <span aria-hidden className="relative whitespace-nowrap leading-none">
          <span className="flex items-center text-[rgb(var(--neon)/0.55)]">{customer.mark}</span>
          <span className="nk-logos-grid-lit absolute inset-0 flex items-center [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [filter:drop-shadow(0_0_1px_rgb(var(--neon)))_drop-shadow(0_0_6px_rgb(var(--neon)/0.75))_drop-shadow(0_0_18px_rgb(var(--neon)/0.4))]">
            {customer.mark}
          </span>
        </span>
        <span
          aria-hidden
          className="absolute bottom-3 left-4 hidden whitespace-nowrap text-[12px] text-white/0 transition-colors duration-300 group-hover:text-white/55 group-focus-visible:text-white/55 sm:block"
        >
          {customer.meta}
        </span>
        <ArrowUpRight
          aria-hidden
          className="absolute right-3 top-3 size-3.5 text-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </a>
    </li>
  );
}

export default function LogosGrid() {
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      // Change the color here; everything inside follows it.
      style={neonVars("white")}
      className="relative bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <style>{css}</style>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-8">
            <h2
              id={titleId}
              className="text-[clamp(2.4rem,4.9vw,3.9rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
            >
              Trusted by teams whose pager actually goes off.
            </h2>
            <p className="mt-6 max-w-[50ch] text-pretty text-[17px] leading-[1.6] text-white/60">
              1,412 engineering teams run production on us, from four-person studios to a national rail operator.
              Twelve of them let us put their name here.
            </p>
            <a
              href="#"
              className="group mt-4 inline-flex items-center gap-1.5 rounded-md py-2 text-[15px] font-medium text-white/85 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
            >
              Read their stories
              <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
          <p className="border-t border-white/[0.08] pt-5 lg:col-span-3 lg:col-start-10 lg:mb-2">
            <span className="block text-[clamp(3.5rem,6vw,5rem)] font-[620] leading-none tracking-[-0.045em] text-white [font-stretch:112%]">
              3.4<span className="ml-2 text-[0.4em] font-medium tracking-[-0.02em] text-white/55">years</span>
            </span>
            <span className="mt-3 block text-[14px] leading-[1.5] text-white/55">Median contract. Most renew without a sales call.</span>
          </p>
        </div>

        <div className="relative mt-16 sm:mt-24">
          <Tick className="-left-[5px] -top-[5px]" />
          <Tick className="-right-[5px] -top-[5px]" />
          <Tick className="-bottom-[5px] -left-[5px]" />
          <Tick className="-bottom-[5px] -right-[5px]" />
          <div className="overflow-hidden">
            <ul className="-mb-px -mr-px grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {customers.map((customer) => (
                <Cell key={customer.name} customer={customer} />
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-white/50">12 of 1,412, shown with permission. Each links to its story.</p>
      </div>
    </section>
  );
}
