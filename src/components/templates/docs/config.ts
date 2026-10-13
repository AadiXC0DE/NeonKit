import type { NeonColor } from "@/lib/neon";

/** Where the template is mounted in your app. Every link between its pages starts here. */
export const basePath = "/preview/docs";

/** The template's color. Change it here and every part of it follows. */
export const color: NeonColor = "green";

export const brand = "Gantry";

export const version = "2.8.1";
export const releasedOn = "30 Sep 2026";
export const repoUrl = "https://github.com/gantry-sh/gantry";
export const repoStars = "4.1k";

/** The install command for each package manager, shown in PackageTabs. */
export const installCommands = {
  npm: "$ npm install -g @gantry/cli",
  pnpm: "$ pnpm add -g @gantry/cli",
  bun: "$ bun add -g @gantry/cli",
  yarn: "$ yarn global add @gantry/cli",
};
