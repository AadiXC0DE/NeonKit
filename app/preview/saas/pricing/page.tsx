import type { Metadata } from "next";
import { SaasPricing } from "@/components/templates/saas/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Nightshift pricing: free for one project, $24 per seat for teams, $48 for orgs. Deploys and rollbacks are never metered.",
};

export default function Page() {
  return <SaasPricing />;
}
