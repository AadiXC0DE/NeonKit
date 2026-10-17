import type { Metadata } from "next";
import { brand, tagline } from "@/components/templates/dashboard/config";
import { Shell } from "@/components/templates/dashboard/shell/shell";

export const metadata: Metadata = {
  title: { default: `${brand} console`, template: `%s · ${brand}` },
  description: tagline,
  openGraph: { title: `${brand} console`, description: tagline, siteName: brand },
  twitter: { title: `${brand} console`, description: tagline },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
