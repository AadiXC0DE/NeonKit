import type { Metadata } from "next";
import { Settings } from "@/components/templates/dashboard/settings/settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Team profile, members and roles, notifications, billing and usage for your Switchback team.",
};

export default function Page() {
  return <Settings />;
}
