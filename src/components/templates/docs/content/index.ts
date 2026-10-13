import type { ComponentType } from "react";

import { CliBuild } from "./cli-build";
import { CliUp } from "./cli-up";
import { Configuration } from "./configuration";
import { Deploying } from "./deploying";
import { Installation } from "./installation";
import { Introduction } from "./introduction";
import { Quickstart } from "./quickstart";
import { Troubleshooting } from "./troubleshooting";

/** Page bodies by slug. Add a page here and to the list in docs.ts. */
export const content: Record<string, ComponentType> = {
  "": Introduction,
  installation: Installation,
  quickstart: Quickstart,
  configuration: Configuration,
  deploying: Deploying,
  troubleshooting: Troubleshooting,
  "cli/up": CliUp,
  "cli/build": CliBuild,
};
