import "server-only";

import { highlight } from "@/lib/highlight";
import type { Highlighted } from "@/components/site/install-tabs";

type Manager = "npm" | "pnpm" | "yarn" | "bun";

const runners: Record<Manager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

const installers: Record<Manager, string> = {
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  bun: "bun add",
};

async function build(make: (pm: Manager) => string) {
  const entries = await Promise.all(
    (Object.keys(runners) as Manager[]).map(async (pm) => {
      const code = make(pm);
      return [pm, { code, html: await highlight(code, "bash") }] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Manager, Highlighted>;
}

export const runCommand = (args: string) => build((pm) => `${runners[pm]} ${args}`);
export const installCommand = (packages: string[]) =>
  build((pm) => `${installers[pm]} ${packages.join(" ")}`);
