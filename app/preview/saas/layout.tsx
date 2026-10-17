import type { Metadata } from "next";
import { Shell } from "@/components/templates/saas/shell";

export const metadata: Metadata = {
  title: { template: "%s · Nightshift", default: "Nightshift" },
  description:
    "Nightshift queues your deploys for the quiet hours, holds them to your health checks and rolls back on its own.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
