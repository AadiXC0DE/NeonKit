import { Marquee } from "@/components/ui/marquee";

const signs = ["Open late", "Karaoke", "Noodles", "Arcade", "Vacancy", "Live jazz", "Cocktails", "Pachinko"];
const cities = ["Hong Kong", "Tokyo", "Las Vegas", "Seoul", "Havana", "Berlin", "Taipei", "Reno"];

export default function MarqueeDemo() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07080d] py-8 [--neon:var(--neon-accent,34_211_238)]">
      {/* Light the signs throw on the wall behind them */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 bg-[radial-gradient(ellipse_55%_50%_at_50%_45%,rgb(var(--neon)/0.14),transparent)]"
      />
      <Marquee speed={36} gap={40} className="py-5">
        {signs.map((sign) => (
          <span key={sign} className="flex items-center gap-10">
            <span
              className="whitespace-nowrap text-4xl tracking-tight [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] [text-shadow:0_0_1px_rgb(255_255_255/0.9),0_0_6px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)),0_0_38px_rgb(var(--neon)/0.6)] sm:text-5xl"
              style={{ fontFamily: "var(--font-tilt-neon)" }}
            >
              {sign}
            </span>
            <span aria-hidden className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
          </span>
        ))}
      </Marquee>
      <Marquee reverse speed={22} gap={28} className="mt-2 py-2">
        {cities.map((city) => (
          <span key={city} className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            {city}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
