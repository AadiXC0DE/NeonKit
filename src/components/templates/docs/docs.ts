import { basePath } from "./config";

export const groups = ["Getting started", "Guides", "CLI reference"] as const;

export type DocGroup = (typeof groups)[number];

export type DocHeading = {
  /** Matches the `id` on the H2 or H3 in the page's content. */
  id: string;
  title: string;
  level: 2 | 3;
};

export type Doc = {
  /** Path below basePath. "" is the docs home; "cli/up" lives at basePath/cli/up. */
  slug: string;
  title: string;
  /** The page's h1, when it should say more than the title in the sidebar. */
  headline?: string;
  /** Shorter label for the sidebar, if it differs from the title. */
  navTitle?: string;
  /** Mono labels read as commands in the sidebar and search. */
  mono?: boolean;
  group: DocGroup;
  description: string;
  updated: string;
  readingTime: string;
  /** Feeds the "On this page" list and ⌘K search. Keep in sync with the page's headings. */
  headings: DocHeading[];
};

export const docs: Doc[] = [
  {
    slug: "",
    title: "Introduction",
    headline: "Containers from your lockfile.",
    group: "Getting started",
    description:
      "Gantry reads the lockfile you already commit, builds images in layers it can reuse and runs them without a daemon. One 9.4 MB binary, no root, and your Dockerfiles keep working.",
    updated: "2 Oct 2026",
    readingTime: "3 min",
    headings: [
      { id: "what-gantry-does", title: "What Gantry does", level: 2 },
      { id: "how-a-run-works", title: "How a run works", level: 2 },
      { id: "when-not-to-use-gantry", title: "When not to use Gantry", level: 2 },
      { id: "where-next", title: "Where to go next", level: 2 },
    ],
  },
  {
    slug: "installation",
    title: "Installation",
    group: "Getting started",
    description:
      "Install the gantry binary with your package manager, check it runs, and turn on shell completion.",
    updated: "30 Sep 2026",
    readingTime: "4 min",
    headings: [
      { id: "install-the-cli", title: "Install the CLI", level: 2 },
      { id: "verify", title: "Verify the install", level: 2 },
      { id: "requirements", title: "System requirements", level: 2 },
      { id: "linux-rootless", title: "Rootless mode on Linux", level: 3 },
      { id: "shell-completion", title: "Shell completion", level: 2 },
      { id: "updating", title: "Updating and uninstalling", level: 2 },
    ],
  },
  {
    slug: "quickstart",
    title: "Quickstart",
    group: "Getting started",
    description:
      "Go from an empty folder to a running web service and database in about five minutes, then change code and watch it reload.",
    updated: "30 Sep 2026",
    readingTime: "5 min",
    headings: [
      { id: "before-you-start", title: "Before you start", level: 2 },
      { id: "create-a-project", title: "Create a project", level: 2 },
      { id: "start-your-services", title: "Start your services", level: 2 },
      { id: "edit-and-reload", title: "Edit and reload", level: 2 },
      { id: "shut-it-down", title: "Shut it down", level: 2 },
      { id: "next-steps", title: "Next steps", level: 2 },
    ],
  },
  {
    slug: "configuration",
    title: "Configuration",
    group: "Guides",
    description:
      "Everything gantry.toml can describe: services, build settings, environment variables and profiles for CI.",
    updated: "24 Sep 2026",
    readingTime: "7 min",
    headings: [
      { id: "gantry-toml", title: "The gantry.toml file", level: 2 },
      { id: "services", title: "Services", level: 2 },
      { id: "health-checks", title: "Health checks", level: 3 },
      { id: "build-settings", title: "Build settings", level: 2 },
      { id: "environment-variables", title: "Environment variables", level: 2 },
      { id: "precedence", title: "Precedence", level: 3 },
      { id: "profiles", title: "Profiles", level: 2 },
    ],
  },
  {
    slug: "deploying",
    title: "Deploying",
    group: "Guides",
    description:
      "Ship the image you tested locally to a registry or straight to a server over SSH, swap it in without downtime, and roll back in one command.",
    updated: "28 Sep 2026",
    readingTime: "6 min",
    headings: [
      { id: "how-shipping-works", title: "How shipping works", level: 2 },
      { id: "push-to-a-registry", title: "Push to a registry", level: 2 },
      { id: "deploy-over-ssh", title: "Deploy to a host over SSH", level: 2 },
      { id: "zero-downtime", title: "Zero-downtime swaps", level: 3 },
      { id: "rolling-back", title: "Rolling back", level: 2 },
      { id: "ship-from-ci", title: "Ship from CI", level: 2 },
    ],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    group: "Guides",
    description:
      "Fixes for the problems people hit most: busy ports, permission errors on Linux, stale layers and slow first builds.",
    updated: "1 Oct 2026",
    readingTime: "5 min",
    headings: [
      { id: "run-gantry-doctor", title: "Run gantry doctor first", level: 2 },
      { id: "port-already-in-use", title: "Port already in use", level: 2 },
      { id: "permission-denied", title: "Permission denied on Linux", level: 2 },
      { id: "stale-layers", title: "Builds ignore lockfile changes", level: 2 },
      { id: "slow-first-build", title: "Slow first build on macOS", level: 2 },
      { id: "getting-help", title: "Getting help", level: 2 },
    ],
  },
  {
    slug: "cli/up",
    title: "gantry up",
    mono: true,
    group: "CLI reference",
    description:
      "Build what changed, start every service in dependency order and wait for health checks. Watches your source and rebuilds on save.",
    updated: "30 Sep 2026",
    readingTime: "4 min",
    headings: [
      { id: "usage", title: "Usage", level: 2 },
      { id: "description", title: "Description", level: 2 },
      { id: "options", title: "Options", level: 2 },
      { id: "examples", title: "Examples", level: 2 },
      { id: "exit-codes", title: "Exit codes", level: 2 },
    ],
  },
  {
    slug: "cli/build",
    title: "gantry build",
    mono: true,
    group: "CLI reference",
    description:
      "Build an OCI image from your lockfile or Dockerfile, reuse cached layers, and optionally push it, for one platform or several.",
    updated: "30 Sep 2026",
    readingTime: "4 min",
    headings: [
      { id: "usage", title: "Usage", level: 2 },
      { id: "description", title: "Description", level: 2 },
      { id: "options", title: "Options", level: 2 },
      { id: "layer-cache", title: "The layer cache", level: 2 },
      { id: "examples", title: "Examples", level: 2 },
      { id: "exit-codes", title: "Exit codes", level: 2 },
    ],
  },
];

export function docHref(slug: string, hash?: string) {
  const path = slug ? `${basePath}/${slug}` : basePath;
  return hash ? `${path}#${hash}` : path;
}

export function findDoc(slug: string) {
  return docs.find((doc) => doc.slug === slug);
}

/** Turns a pathname from usePathname() back into a doc slug. */
export function slugFromPathname(pathname: string) {
  return pathname.slice(basePath.length).replace(/^\/+|\/+$/g, "");
}

export function neighbours(slug: string) {
  const index = docs.findIndex((doc) => doc.slug === slug);
  return {
    previous: index > 0 ? docs[index - 1] : undefined,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : undefined,
  };
}
