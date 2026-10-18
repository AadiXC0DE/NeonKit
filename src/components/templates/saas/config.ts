import type { NeonColor } from "@/lib/neon";

/** Where the template is mounted in your app. Every link between its pages starts here. */
export const basePath = "/preview/saas";

/** The template's color. Change it here and every part of it follows. */
export const color: NeonColor = "magenta";

export const brand = "Nightshift";

/** The hour (local time) the deploy window opens. Countdowns across the site aim at it. */
export const windowHour = 2;

export const contactEmail = "crew@nightshift.example";

/**
 * Landing-page sections in scroll order. The navbar, the section rail and the
 * mobile bar all read from here. `clock` is the time the rail shows as you pass.
 */
export const sections = [
  { id: "instruments", label: "Instruments", clock: "22:30", nav: true },
  { id: "install", label: "Install", clock: "23:15", nav: true },
  { id: "pricing", label: "Pricing", clock: "00:20", nav: false },
  { id: "customers", label: "Customers", clock: "01:05", nav: true },
  { id: "faq", label: "Questions", clock: "01:40", nav: true },
  { id: "deploy", label: "Deploy", clock: "02:00", nav: false },
] as const;

export type SectionId = (typeof sections)[number]["id"];
