import type { Metadata } from "next";
import { brand } from "@/components/templates/dashboard/config";
import { Overview } from "@/components/templates/dashboard/overview/overview";

export const metadata: Metadata = {
  // A layout's title template only reaches the segments below it, so this page spells its title out.
  title: { absolute: `Overview · ${brand}` },
  description: "Traffic, latency, region health and the latest deployments across every Switchback project.",
};

export default function Page() {
  return <Overview />;
}
