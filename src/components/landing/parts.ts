/** The lightable parts of the Nightshift screen, and the callouts that name them. */
export type PartKey = "palette" | "row" | "live" | "action" | "chart";

export const parts: { key: PartKey; name: string; slug: string; why: string }[] = [
  { key: "live", name: "Badge", slug: "badge", why: "Live status" },
  { key: "chart", name: "Glow chart", slug: "glow-chart", why: "The line you read" },
  { key: "row", name: "Table", slug: "table", why: "The selected row" },
  { key: "action", name: "Button", slug: "button", why: "The one thing to press" },
  { key: "palette", name: "Command", slug: "command", why: "Where focus is" },
];
