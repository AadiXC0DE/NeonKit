import { Cityscape } from "@/components/ui/cityscape";

const links = {
  Product: ["Changelog", "Pricing", "Status"],
  Company: ["About", "Careers", "Press"],
};

export default function CityscapeFooter() {
  return (
    <footer className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
      <Cityscape parallax seed={11} signs={["OPEN"]} style={{ fontFamily: "var(--font-tilt-neon)" }} />
      <div className="relative grid gap-8 p-8 pb-56 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold tracking-tight text-white/90">Nightowl</p>
          <p className="mt-1.5 max-w-[16rem] text-sm text-white/55">Monitoring for teams who get paged at 2am.</p>
        </div>
        {Object.entries(links).map(([group, items]) => (
          <div key={group}>
            <p className="text-sm font-medium text-white/90">{group}</p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              {items.map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="rounded-[4px] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
