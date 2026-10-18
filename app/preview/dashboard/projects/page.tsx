import type { Metadata } from "next";
import { Projects } from "@/components/templates/dashboard/projects/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project on the team: status, framework, region and traffic, with search, filters and quick actions.",
};

export default function Page() {
  return <Projects />;
}
