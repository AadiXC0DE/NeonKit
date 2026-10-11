import { Mail, MessagesSquare, Rss } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

const links = [
  { label: "Email the studio", icon: Mail, href: "mailto:hello@example.com" },
  { label: "Join the community chat", icon: MessagesSquare, href: "#community" },
  { label: "Subscribe to the RSS feed", icon: Rss, href: "/changelog" },
];

export default function MagneticButtonIcons() {
  return (
    <nav aria-label="Elsewhere" className="flex items-center gap-4">
      {links.map(({ label, icon: Icon, href }) => (
        <MagneticButton key={label} asChild size="icon" strength={0.35} radius={40}>
          <a href={href} aria-label={label}>
            <Icon />
          </a>
        </MagneticButton>
      ))}
    </nav>
  );
}
