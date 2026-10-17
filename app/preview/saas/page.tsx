import type { Metadata } from "next";
import { SaasHome } from "@/components/templates/saas/home";

export const metadata: Metadata = {
  title: { absolute: "Nightshift: deploys that land at 2am" },
  description:
    "Queue a deploy before you log off. Nightshift ships it in the quiet window, checks its health, rolls back if needed and sends a report by breakfast.",
};

export default function Page() {
  return <SaasHome />;
}
