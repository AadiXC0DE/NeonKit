import type { NeonColor } from "@/lib/neon";

/** Where the template is mounted in your app. Every link between its pages starts here. */
export const basePath = "/preview/dashboard";

/** The template's color. Change it here and every part of it follows. */
export const color: NeonColor = "cyan";

export const brand = "Switchback";

export const tagline = "Deploys, regions and rollbacks for the whole team, in one console.";

/** The signed-in team and person. Swap these for your session. */
export const team = { name: "Marlow", slug: "marlow", plan: "Pro" };
export const viewer = { name: "Rhea Castellanos", email: "rhea@marlow.dev" };

export const nav = [
  { href: "", label: "Overview", keys: "G O" },
  { href: "/projects", label: "Projects", keys: "G P" },
  { href: "/settings", label: "Settings", keys: "G S" },
] as const;
