import type { Metadata } from "next";
import { Overview } from "@/components/templates/dashboard/overview/overview";

export const metadata: Metadata = {
  title: "Overview",
  description: "Traffic, latency, region health and the latest deployments across every Switchback project.",
};

export default function Page() {
  return <Overview />;
}
