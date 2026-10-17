// Mock data for the Nightshift template. Swap these for your own numbers and copy.

export const stats = {
  teams: "3,912",
  landed: "1,284,906",
  rolledBack: "0.4%",
};

// --- Tonight's queue, as the bento panel runs it -----------------------------

export type Outcome = "land" | "regress";

export type QueuedDeploy = {
  service: string;
  sha: string;
  message: string;
  author: string;
  /** Simulated wall-clock minutes after 02:00 that each phase finishes. */
  took: string;
  outcome: Outcome;
  /** What the health checks read once it's live. */
  p95: number;
  errors: string;
};

export const queue: QueuedDeploy[] = [
  {
    service: "storefront",
    sha: "a1c93e2",
    message: "Cache product pages at the edge",
    author: "Maya Okafor",
    took: "2m 41s",
    outcome: "land",
    p95: 184,
    errors: "0.02%",
  },
  {
    service: "billing-api",
    sha: "7f02d1b",
    message: "Retry webhooks with jittered backoff",
    author: "Tom Weller",
    took: "38s",
    outcome: "regress",
    p95: 1840,
    errors: "3.1%",
  },
  {
    service: "search",
    sha: "3be8c40",
    message: "Bump tokenizer to 2.4",
    author: "Ines Duarte",
    took: "3m 05s",
    outcome: "land",
    p95: 96,
    errors: "0.00%",
  },
  {
    service: "auth",
    sha: "c04f7aa",
    message: "Rotate session signing keys",
    author: "Rafael Mendes",
    took: "1m 18s",
    outcome: "land",
    p95: 62,
    errors: "0.00%",
  },
  {
    service: "mobile-bff",
    sha: "e91d5a7",
    message: "Drop v1 auth headers",
    author: "Sam Okoro",
    took: "1m 52s",
    outcome: "land",
    p95: 141,
    errors: "0.01%",
  },
];

/** Health rules a deploy has to hold for a minute on canary. */
export const rules = [
  { metric: "p95 latency", limit: "< 400 ms" },
  { metric: "5xx rate", limit: "< 1%" },
  { metric: "GET /healthz", limit: "200" },
];

// --- Install -----------------------------------------------------------------

export const managers = {
  npm: { install: "npm install -D @nightshift/cli", run: "npx" },
  pnpm: { install: "pnpm add -D @nightshift/cli", run: "pnpm dlx" },
  bun: { install: "bun add -d @nightshift/cli", run: "bunx" },
  yarn: { install: "yarn add -D @nightshift/cli", run: "yarn dlx" },
} as const;

export type Manager = keyof typeof managers;

export const cliSpecs = [
  { label: "Binary", value: "6.1 MB, one file" },
  { label: "Reads from", value: "GitHub, GitLab" },
  { label: "Deploys to", value: "Vercel, Fly, Kubernetes, ECS" },
  { label: "License", value: "MIT" },
];

// --- Pricing -----------------------------------------------------------------

export type Billing = "monthly" | "yearly";

// Yearly is ten months' price for twelve, shown per month.
export const plans = [
  {
    name: "Solo",
    pitch: "One project and a bedtime.",
    monthly: 0,
    yearly: 0,
    unit: "free for good",
    limits: [
      ["Projects", "1"],
      ["Deploys", "60 / mo"],
      ["Seats", "1"],
    ],
    features: [
      "One nightly window per environment",
      "HTTP health checks on /healthz",
      "Rollback on a failed check",
      "The morning report, by email",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Crew",
    pitch: "For teams that ship every night.",
    monthly: 24,
    yearly: 20,
    unit: "per seat / month",
    limits: [
      ["Projects", "No limit"],
      ["Deploys", "No limit"],
      ["Seats", "Up to 50"],
    ],
    features: [
      "Everything in Solo, reports kept a year",
      "Rules on p95, error rate or any Prometheus query",
      "Canary steps: 10% → 50% → 100%",
      "Slack, PagerDuty and Linear",
      "A freeze calendar for holidays and launches",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Fleet",
    pitch: "For orgs with windows in every time zone.",
    monthly: 48,
    yearly: 40,
    unit: "per seat / month",
    limits: [
      ["Projects", "No limit"],
      ["Regions", "Any"],
      ["Seats", "No limit"],
    ],
    features: [
      "Everything in Crew, plus SSO and SCIM",
      "Approvals for production windows",
      "An audit log your auditor will like",
      "99.99% uptime SLA, support in 1 hour",
    ],
    cta: "Talk to us",
    featured: false,
  },
] as const;

export type Plan = (typeof plans)[number];

// true = included, false = not included, string = the limit. One value per plan, in order.
type Value = boolean | string;
export const comparison: { name: string; rows: { feature: string; tip: string; values: [Value, Value, Value] }[] }[] = [
  {
    name: "Scheduling",
    rows: [
      {
        feature: "Deploy windows",
        tip: "A time range per environment when queued deploys may go out.",
        values: ["1 per env", "Unlimited", "Unlimited"],
      },
      {
        feature: "Scheduled deploys",
        tip: "Each queued release counts once, however many steps it takes.",
        values: ["60 / mo", "Unlimited", "Unlimited"],
      },
      {
        feature: "Ship now",
        tip: "Skip the queue for a hotfix with `nightshift ship --now`. Still health-checked.",
        values: [true, true, true],
      },
      {
        feature: "Freeze calendar",
        tip: "Block windows over holidays, launches or a big customer's quarter close.",
        values: [false, true, true],
      },
      {
        feature: "Follow-the-sun windows",
        tip: "One release, rolled region by region at each region's own 2am.",
        values: [false, false, true],
      },
    ],
  },
  {
    name: "Safety",
    rows: [
      {
        feature: "Health checks",
        tip: "What a deploy must hold for a minute on canary before it's promoted.",
        values: ["HTTP only", "Any metric", "Any metric"],
      },
      {
        feature: "Automatic rollback",
        tip: "A failed check rolls the release back and keeps the evidence for the report.",
        values: [true, true, true],
      },
      {
        feature: "Canary steps",
        tip: "Traffic shifts in steps and every step is checked before the next.",
        values: [false, "3 steps", "Custom"],
      },
      {
        feature: "Production approvals",
        tip: "Someone signs off before a window touches production. Logged with a reason.",
        values: [false, false, true],
      },
    ],
  },
  {
    name: "Reports and alerts",
    rows: [
      {
        feature: "Morning report",
        tip: "What shipped, what rolled back and the graphs that decided it, at 07:30 local.",
        values: ["Email", "Email, Slack", "Email, Slack"],
      },
      {
        feature: "Report history",
        tip: "How long reports and their graphs are kept.",
        values: ["14 days", "1 year", "Forever"],
      },
      {
        feature: "Paging",
        tip: "Who gets woken when a rollback itself fails. It has happened 11 times, ever.",
        values: [false, "PagerDuty, Opsgenie", "PagerDuty, Opsgenie"],
      },
    ],
  },
  {
    name: "Admin and support",
    rows: [
      {
        feature: "Seats",
        tip: "Anyone who can queue or approve a deploy. People who only read reports are free.",
        values: ["1", "Up to 50", "Unlimited"],
      },
      {
        feature: "SSO and SCIM",
        tip: "SAML sign-on with Okta, Entra ID or Google, and automatic deprovisioning.",
        values: [false, false, true],
      },
      {
        feature: "Audit log",
        tip: "Every queue, approval, rollback and setting change, exportable as JSON.",
        values: [false, "90 days", "Unlimited"],
      },
      {
        feature: "Uptime SLA",
        tip: "Monthly, with service credits if we miss it.",
        values: [false, "99.9%", "99.99%"],
      },
      { feature: "Support", tip: "Who answers and how fast.", values: ["Forum", "Email, 1 day", "Slack, 1 hour"] },
    ],
  },
];

// --- Customers ---------------------------------------------------------------

export type Quote = {
  name: string;
  role: string;
  company: string;
  quote: string;
  metric?: { label: string; value: string };
  featured?: boolean;
};

// Ordered so the three CSS columns come out close to even.
export const quotes: Quote[] = [
  {
    name: "Priya Raman",
    role: "Staff engineer",
    company: "Okapi Freight",
    metric: { label: "After-hours pages a month", value: "14 → 0" },
    quote:
      "We moved every production deploy to 02:00 and stopped staying late on Thursdays. 212 releases since March, three rollbacks, and nobody's phone rang for any of them.",
    featured: true,
  },
  {
    name: "Tom Weller",
    role: "Engineering manager",
    company: "Saltmarsh",
    quote:
      "The rollback fired at 02:07 and the report was in my inbox at 07:30 with the graph that tripped it. I had the fix up before standup.",
  },
  {
    name: "Sam Okoro",
    role: "CTO",
    company: "Pellucid",
    quote: "I stopped setting alarms for releases. That's the review.",
  },
  {
    name: "Marcus Bell",
    role: "SRE",
    company: "Brickyard",
    quote: "Canary at 10%, p95 over 400 ms for a minute, gone. It's done that four times and been right four times.",
  },
  {
    name: "Hannah Lindqvist",
    role: "Infrastructure lead",
    company: "Coldharbour",
    metric: { label: "Release-night overtime a month", value: "−31 h" },
    quote:
      "We ran a release rota: one engineer a week, awake from one to three with a checklist. The rota's gone. The checklist is four lines of nightshift.toml now.",
  },
  {
    name: "Ines Duarte",
    role: "Platform lead",
    company: "Verso Rail",
    quote:
      "Our customers are asleep at 2am too, which is the whole point. The error budget went from a monthly argument to a number nobody needs to look at.",
  },
  {
    name: "Grace Achebe",
    role: "Engineering manager",
    company: "quillon",
    quote: "We rolled it out to 60 engineers in a week. The freeze calendar alone stopped two Christmas incidents.",
  },
  {
    name: "Aiko Tanaka",
    role: "Design engineer",
    company: "tessel",
    quote: "I queue my CSS at five and wake up to a link. It's like having a release manager who doesn't mind nights.",
  },
  {
    name: "Dana Whitfield",
    role: "VP Engineering",
    company: "Arkline",
    metric: { label: "Change failure rate", value: "11% → 2.4%" },
    quote: "Smaller batches, shipped every night, checked every time. The DORA numbers moved on their own.",
  },
  {
    name: "Rafael Mendes",
    role: "Security lead",
    company: "Halvard & Co.",
    quote:
      "Every production window has an approver, a diff and a reason. Our auditor asked for the log once and had no follow-up questions.",
  },
  {
    name: "Owen Price",
    role: "On-call lead",
    company: "Plinth",
    quote: "Our runbook had a section called “babysit the release”. I deleted it in March and nobody noticed.",
  },
];

// --- Questions ---------------------------------------------------------------

export type Faq = { id: string; q: string; a: string };

export const faqs: Faq[] = [
  {
    id: "fails",
    q: "What happens if a deploy fails at 2am?",
    a: "It rolls back on its own. A release has to hold your health rules for a minute at each canary step; the first one it breaks, Nightshift shifts traffic back, keeps the graphs, and puts the whole thing at the top of the morning report. Nobody is paged unless the rollback itself fails.",
  },
  {
    id: "platforms",
    q: "Which platforms can it deploy to?",
    a: "Vercel, Fly, Render, Kubernetes (any cluster you can kubectl into), ECS and plain SSH targets. Nightshift doesn't replace your pipeline: it runs the deploy step you already have, at the time you chose.",
  },
  {
    id: "healthy",
    q: "How does it decide a deploy is healthy?",
    a: "By default: /healthz returns 200, p95 stays under 400 ms and 5xx under 1%, each for 60 seconds. On Crew you can write rules against any Prometheus, Datadog or Honeycomb query, per service.",
  },
  {
    id: "now",
    q: "Can I still ship something right now?",
    a: "Yes. `nightshift ship --now` skips the queue for a hotfix. It still goes through canary and health checks, it just doesn't wait for the window.",
  },
  {
    id: "order",
    q: "What if two deploys depend on each other?",
    a: "Queue them with `--after`. Nightshift runs them in order and won't start the second until the first has held its checks. If the first rolls back, the second stays queued for the next night.",
  },
  {
    id: "timezone",
    q: "Whose 2am is it?",
    a: "Whichever you pick. Each environment gets its own window in its own time zone, so you can aim for your users' quiet hours rather than yours. On Fleet a single release can follow the sun, region by region.",
  },
  {
    id: "access",
    q: "Does Nightshift need access to production?",
    a: "Only to the deploy step. It uses a short-lived token from your CI provider for each run and never sees your database or secrets. The agent is open source if your security team wants to read it.",
  },
];

export const pricingFaqs: Faq[] = [
  {
    id: "seat",
    q: "What counts as a seat?",
    a: "Anyone who can queue, approve or cancel a deploy. People who only read the morning report are free, and so are bots and CI tokens.",
  },
  {
    id: "per-deploy",
    q: "Do you charge per deploy?",
    a: "No. Crew and Fleet ship as often as you like. Solo stops queuing at 60 deploys a month and tells you before it does.",
  },
  {
    id: "trial",
    q: "Is there a trial of Crew?",
    a: "Fourteen days with every Crew feature and no card. When it ends you drop to Solo unless you choose a plan; nothing is deleted.",
  },
  {
    id: "switch",
    q: "Can I switch between monthly and yearly?",
    a: "Any time. Going yearly credits what's left of your month; going monthly starts when your year ends.",
  },
  {
    id: "discounts",
    q: "Do you discount for open source or nonprofits?",
    a: "Crew is free for public open-source projects and half price for registered nonprofits and schools. Email us from the project's domain.",
  },
  {
    id: "downgrade",
    q: "What happens to my reports if I downgrade?",
    a: "They stay readable for the history your new plan keeps, and you can export everything as JSON before you switch.",
  },
  {
    id: "invoice",
    q: "Can we pay by invoice?",
    a: "On yearly Fleet plans, yes: net 30, purchase orders welcome, and we'll fill in your vendor security questionnaire.",
  },
];
