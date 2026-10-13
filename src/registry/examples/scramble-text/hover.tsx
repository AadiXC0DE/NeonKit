import { ScrambleText } from "@/components/ui/scramble-text";

const links = [
  { label: "Changelog", href: "#changelog" },
  { label: "GitHub", href: "#github" },
  { label: "Sponsor", href: "#sponsor" },
  { label: "Contact", href: "#contact" },
];

export default function ScrambleTextHover() {
  return (
    <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-md font-mono text-sm text-white/60 outline-none transition-colors hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]"
        >
          <ScrambleText text={link.label} trigger="hover" duration={500} charset="symbols" />
        </a>
      ))}
    </nav>
  );
}
