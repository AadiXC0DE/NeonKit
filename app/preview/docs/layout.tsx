import type { Metadata } from "next";

import { DocsShell } from "@/components/templates/docs/shell";

export const metadata: Metadata = {
  title: { absolute: "Gantry docs", template: "%s · Gantry docs" },
  description:
    "Documentation for Gantry, the container CLI that builds from your lockfile and runs without a daemon.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
