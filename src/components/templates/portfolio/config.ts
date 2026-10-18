import type { NeonColor } from "@/lib/neon";

/** Where the template is mounted in your app. Every link between its pages starts here. */
export const basePath = "/preview/portfolio";

/** The template's color. Change it here and every part of it follows. */
export const color: NeonColor = "amber";

export const brand = "Juno Park";

export const role = "Design engineer";
export const city = "Rotterdam";
export const email = "hello@junopark.studio";
export const availability = "Booking projects for March 2027";

/** In-page sections, in order. The header nav and the scroll spy read this. */
export const sections = [
  { id: "work", label: "Work" },
  { id: "now", label: "Now" },
  { id: "experience", label: "Experience" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;

export const socials = [
  { label: "GitHub", href: "https://github.com/junopark" },
  { label: "Mastodon", href: "https://mastodon.social/@junopark" },
  { label: "Read.cv", href: "https://read.cv/junopark" },
];
