import { Marquee } from "@/components/ui/marquee";

const quotes = [
  { body: "Swapped our status page to it in an afternoon. The meters finally look like hardware.", name: "Ines Duarte", role: "SRE, Tidewater" },
  { body: "The glow only shows up where something is happening. That restraint is the whole trick.", name: "Kenji Mori", role: "Design lead, Orbital" },
  { body: "We copied one file and deleted four hundred lines of our own CSS.", name: "Priya Raman", role: "Frontend, Halcyon" },
  { body: "Keyboard support was already done. I checked every component and had nothing to file.", name: "Sam Okoro", role: "Accessibility, Northwind" },
  { body: "Our dashboard looked like a spreadsheet. Now it looks like a control room.", name: "Lena Fischer", role: "Founder, Voltline" },
  { body: "Reduced motion is handled everywhere, not just where someone remembered.", name: "Tomás Rey", role: "Engineer, Summit Labs" },
];

function Quote({ body, name, role }: (typeof quotes)[number]) {
  return (
    <figure className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <blockquote className="text-sm leading-relaxed text-white/80">{body}</blockquote>
      <figcaption className="mt-3 text-xs text-white/45">
        <span className="text-white/80">{name}</span> · {role}
      </figcaption>
    </figure>
  );
}

export default function MarqueeVertical() {
  return (
    <div className="grid h-96 w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <Marquee orientation="vertical" speed={24} gap={16} fade={64} className="h-full">
        {quotes.slice(0, 3).map((quote) => (
          <Quote key={quote.name} {...quote} />
        ))}
      </Marquee>
      <Marquee orientation="vertical" reverse speed={20} gap={16} fade={64} className="hidden h-full sm:flex">
        {quotes.slice(3).map((quote) => (
          <Quote key={quote.name} {...quote} />
        ))}
      </Marquee>
    </div>
  );
}
