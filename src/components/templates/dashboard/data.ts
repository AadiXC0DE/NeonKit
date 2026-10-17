// Mock data for the console. Swap these for your API; the shapes are what the pages read.

export type ProjectStatus = "ready" | "building" | "failed" | "paused";
export type Framework = "Next.js" | "Astro" | "SvelteKit" | "Remix" | "Node" | "Go";
export type RegionCode = "iad" | "pdx" | "dub" | "fra" | "sin" | "gru";
export type Role = "Owner" | "Admin" | "Developer" | "Viewer";

export interface Project {
  id: string;
  name: string;
  domain: string;
  framework: Framework;
  status: ProjectStatus;
  region: RegionCode;
  /** Requests in the last 24 hours. */
  requests: number;
  /** Minutes since the last deploy. */
  deployedAgo: number;
  branch: string;
  repo: string;
}

export interface Deployment {
  id: string;
  project: string;
  status: Exclude<ProjectStatus, "paused">;
  branch: string;
  commit: string;
  sha: string;
  author: string;
  environment: "Production" | "Preview";
  /** Build time in seconds. */
  duration: number;
  age: string;
}

export interface Region {
  code: RegionCode;
  city: string;
  zone: string;
  status: "serving" | "degraded";
  /** Requests per second right now. */
  rps: number;
  p95: number;
  /** Share of capacity in use, 0 to 1. */
  load: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActive: string;
  pending?: boolean;
}

export interface Notice {
  id: string;
  tone: "error" | "warning" | "info";
  title: string;
  body: string;
  age: string;
  unread: boolean;
}

export const FRAMEWORKS: Framework[] = ["Next.js", "Astro", "SvelteKit", "Remix", "Node", "Go"];

export const PROJECTS: Project[] = [
  { id: "p01", name: "storefront", domain: "marlow.shop", framework: "Next.js", status: "ready", region: "iad", requests: 18_420_000, deployedAgo: 12, branch: "main", repo: "marlow/storefront" },
  { id: "p02", name: "checkout-api", domain: "checkout.marlow.shop", framework: "Go", status: "ready", region: "iad", requests: 9_712_000, deployedAgo: 41, branch: "main", repo: "marlow/checkout" },
  { id: "p03", name: "analytics-ingest", domain: "in.marlow.dev", framework: "Node", status: "ready", region: "sin", requests: 11_904_000, deployedAgo: 420, branch: "main", repo: "marlow/ingest" },
  { id: "p04", name: "edge-auth", domain: "auth.marlow.dev", framework: "Go", status: "ready", region: "fra", requests: 7_380_000, deployedAgo: 126, branch: "main", repo: "marlow/edge-auth" },
  { id: "p05", name: "image-proxy", domain: "img.marlow.shop", framework: "Go", status: "ready", region: "sin", requests: 6_050_000, deployedAgo: 1_480, branch: "main", repo: "marlow/image-proxy" },
  { id: "p06", name: "realtime-gateway", domain: "rt.marlow.dev", framework: "Go", status: "ready", region: "dub", requests: 5_480_000, deployedAgo: 244, branch: "main", repo: "marlow/realtime" },
  { id: "p07", name: "webhooks", domain: "hooks.marlow.dev", framework: "Node", status: "failed", region: "iad", requests: 4_410_000, deployedAgo: 18, branch: "fix/retry-backoff", repo: "marlow/webhooks" },
  { id: "p08", name: "mobile-bff", domain: "m.marlow.shop", framework: "Node", status: "ready", region: "gru", requests: 3_120_000, deployedAgo: 545, branch: "main", repo: "marlow/mobile-bff" },
  { id: "p09", name: "marketing-site", domain: "marlow.com", framework: "Astro", status: "building", region: "iad", requests: 2_870_000, deployedAgo: 1, branch: "main", repo: "marlow/marketing" },
  { id: "p10", name: "docs", domain: "docs.marlow.dev", framework: "Astro", status: "ready", region: "pdx", requests: 1_204_000, deployedAgo: 188, branch: "main", repo: "marlow/docs" },
  { id: "p11", name: "search-indexer", domain: "search.marlow.dev", framework: "Node", status: "ready", region: "fra", requests: 890_000, deployedAgo: 362, branch: "main", repo: "marlow/search" },
  { id: "p12", name: "admin-console", domain: "admin.marlow.dev", framework: "Next.js", status: "ready", region: "dub", requests: 312_000, deployedAgo: 301, branch: "main", repo: "marlow/admin" },
  { id: "p13", name: "partner-portal", domain: "partners.marlow.com", framework: "Remix", status: "failed", region: "iad", requests: 221_000, deployedAgo: 52, branch: "main", repo: "marlow/partners" },
  { id: "p14", name: "status-page", domain: "status.marlow.com", framework: "SvelteKit", status: "ready", region: "pdx", requests: 154_000, deployedAgo: 2_910, branch: "main", repo: "marlow/status" },
  { id: "p15", name: "design-system", domain: "ds.marlow.dev", framework: "Next.js", status: "ready", region: "pdx", requests: 48_200, deployedAgo: 4_380, branch: "main", repo: "marlow/design-system" },
  { id: "p16", name: "billing-worker", domain: "billing.internal", framework: "Go", status: "paused", region: "iad", requests: 0, deployedAgo: 17_300, branch: "main", repo: "marlow/billing" },
];

export const DEPLOYMENTS: Deployment[] = [
  { id: "d1", project: "marketing-site", status: "building", branch: "main", commit: "Swap hero copy for the March launch", sha: "9f3c2a1", author: "Ana Ruiz", environment: "Production", duration: 64, age: "just now" },
  { id: "d2", project: "storefront", status: "ready", branch: "main", commit: "Cache product fragments at the edge", sha: "4be81d0", author: "Rhea Castellanos", environment: "Production", duration: 98, age: "12m ago" },
  { id: "d3", project: "webhooks", status: "failed", branch: "fix/retry-backoff", commit: "Cap retry backoff at five minutes", sha: "e07a9c3", author: "Tomás Ilić", environment: "Preview", duration: 52, age: "18m ago" },
  { id: "d4", project: "checkout-api", status: "ready", branch: "main", commit: "Reject expired idempotency keys", sha: "71d24fe", author: "Priya Raman", environment: "Production", duration: 131, age: "41m ago" },
  { id: "d5", project: "partner-portal", status: "failed", branch: "main", commit: "Move session cookie to SameSite=Lax", sha: "c3a9e18", author: "Jonah Okafor", environment: "Production", duration: 62, age: "52m ago" },
  { id: "d6", project: "edge-auth", status: "ready", branch: "main", commit: "Rotate signing keys every 12 hours", sha: "2fd10b7", author: "Ana Ruiz", environment: "Production", duration: 48, age: "2h ago" },
  { id: "d7", project: "docs", status: "ready", branch: "feat/flags-search", commit: "Index CLI flags in search", sha: "a81e3c4", author: "Mei Tanaka", environment: "Preview", duration: 81, age: "3h ago" },
  { id: "d8", project: "realtime-gateway", status: "ready", branch: "main", commit: "Drop idle sockets after 90 seconds", sha: "5c6b0e2", author: "Tomás Ilić", environment: "Production", duration: 115, age: "4h ago" },
];

export const REGIONS: Region[] = [
  { code: "iad", city: "Ashburn", zone: "us-east", status: "serving", rps: 1_184, p95: 38, load: 0.62 },
  { code: "pdx", city: "Portland", zone: "us-west", status: "serving", rps: 412, p95: 41, load: 0.34 },
  { code: "dub", city: "Dublin", zone: "eu-west", status: "serving", rps: 506, p95: 36, load: 0.41 },
  { code: "fra", city: "Frankfurt", zone: "eu-central", status: "serving", rps: 688, p95: 33, load: 0.48 },
  { code: "sin", city: "Singapore", zone: "ap-southeast", status: "serving", rps: 597, p95: 44, load: 0.55 },
  { code: "gru", city: "São Paulo", zone: "sa-east", status: "degraded", rps: 231, p95: 212, load: 0.86 },
];

export const MEMBERS: Member[] = [
  { id: "m1", name: "Rhea Castellanos", email: "rhea@marlow.dev", role: "Owner", lastActive: "Now" },
  { id: "m2", name: "Ana Ruiz", email: "ana@marlow.dev", role: "Admin", lastActive: "4 min ago" },
  { id: "m3", name: "Tomás Ilić", email: "tomas@marlow.dev", role: "Developer", lastActive: "18 min ago" },
  { id: "m4", name: "Priya Raman", email: "priya@marlow.dev", role: "Developer", lastActive: "1 h ago" },
  { id: "m5", name: "Mei Tanaka", email: "mei@marlow.dev", role: "Developer", lastActive: "3 h ago" },
  { id: "m6", name: "Jonah Okafor", email: "jonah@marlow.dev", role: "Viewer", lastActive: "Yesterday" },
];

export const NOTICES: Notice[] = [
  { id: "n1", tone: "info", title: "storefront is live", body: "4be81d0 is serving marlow.shop in all six regions.", age: "12m", unread: true },
  { id: "n2", tone: "error", title: "Preview failed on webhooks", body: "fix/retry-backoff exited with code 1 after 52s.", age: "18m", unread: true },
  { id: "n3", tone: "warning", title: "São Paulo is degraded", body: "p95 is up to 212 ms. Traffic is still being served.", age: "26m", unread: true },
  { id: "n4", tone: "info", title: "Build minutes at 61%", body: "1,842 of 3,000 used, 18 days left in the cycle.", age: "2h", unread: false },
  { id: "n5", tone: "info", title: "Certificate renewed", body: "auth.marlow.dev is covered until Jan 11, 2027.", age: "1d", unread: false },
];

export const USAGE = [
  { id: "minutes", label: "Build minutes", used: 1_842, limit: 3_000, unit: "min" },
  { id: "bandwidth", label: "Bandwidth", used: 612, limit: 1_000, unit: "GB" },
  { id: "requests", label: "Edge requests", used: 71.4, limit: 100, unit: "M" },
  { id: "functions", label: "Function compute", used: 88.6, limit: 100, unit: "GB-h" },
];

export const INVOICES = [
  { id: "SWB-2026-10", date: "Oct 1, 2026", amount: 164 },
  { id: "SWB-2026-09", date: "Sep 1, 2026", amount: 152 },
  { id: "SWB-2026-08", date: "Aug 1, 2026", amount: 140 },
];

/* Time series for the traffic chart. Seeded, so the server and the browser draw the same lines. */

export type Metric = "requests" | "latency" | "errors" | "deploys";
export type Range = "24h" | "7d" | "30d";

/** The console's "now". Fixed, so nothing renders differently on the server and the client. */
export const NOW = Date.UTC(2026, 9, 13, 14, 0);
const HOUR = 3_600_000;

export const RANGES: Record<Range, { label: string; points: number; step: number }> = {
  "24h": { label: "24 hours", points: 24, step: HOUR },
  "7d": { label: "7 days", points: 42, step: 4 * HOUR },
  "30d": { label: "30 days", points: 30, step: 24 * HOUR },
};

function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Traffic peaks mid-afternoon UTC, when both the US and Europe are awake.
function daylight(time: number) {
  const hour = new Date(time).getUTCHours();
  return 0.62 + 0.38 * Math.sin(((hour - 8) / 24) * Math.PI * 2);
}

function series(metric: Metric, range: Range, offset: number) {
  const { points, step } = RANGES[range];
  const random = seeded(({ requests: 7, latency: 19, errors: 31, deploys: 43 })[metric] * 97 + offset * 13 + points);
  const end = NOW - offset * points * step;
  return Array.from({ length: points }, (_, i) => {
    const time = end - (points - 1 - i) * step;
    const day = daylight(time);
    const noise = random();
    const hours = step / HOUR;
    const growth = 1 - offset * 0.06;
    let y: number;
    if (metric === "requests") y = (range === "30d" ? 48.2e6 : 3.25e6 * hours) * (range === "30d" ? 0.9 + noise * 0.2 : day * (0.92 + noise * 0.16)) * growth;
    else if (metric === "latency") y = 34 + (1 - day) * 4 + day * 6 + noise * 5 + offset * 3 + (i === points - 4 && offset === 0 ? 11 : 0);
    else if (metric === "errors") y = 0.025 + noise * 0.02 + (i === points - 3 && offset === 0 ? 0.05 : 0) + offset * 0.004;
    else y = Math.round(hours * day * (0.4 + noise * 1.6) * growth);
    return { x: new Date(time), y };
  });
}

export function metricSeries(metric: Metric, range: Range) {
  return { current: series(metric, range, 0), previous: series(metric, range, 1) };
}

/** Totals for requests and deploys, averages for latency and error rate. */
export function summarize(metric: Metric, values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);
  return metric === "requests" || metric === "deploys" ? sum : sum / values.length;
}
