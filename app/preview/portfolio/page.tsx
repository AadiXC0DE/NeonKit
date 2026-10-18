import type { Metadata } from "next";
import { brand, city, role } from "@/components/templates/portfolio/config";
import { PortfolioTemplate } from "@/components/templates/portfolio/home";

export const metadata: Metadata = {
  title: { absolute: `${brand} · ${role} in ${city}` },
  description: `${brand} designs interfaces and builds them. Selected work, writing and availability for product teams, from ${city}.`,
};

export default function Page() {
  return <PortfolioTemplate />;
}
