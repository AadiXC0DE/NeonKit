import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { basePath } from "../config";
import { DEPLOYMENTS, metricSeries, summarize } from "../data";
import { PageHeader } from "../parts/page-header";
import { RecentDeployments } from "./deployments";
import { LiveClock } from "./live-clock";
import { Regions } from "./regions";
import { Traffic } from "./traffic";

const shipped = summarize("deploys", metricSeries("deploys", "24h").current.map((p) => p.y));
const failed = DEPLOYMENTS.filter((d) => d.status === "failed").length;

export function Overview() {
  return (
    <>
      <PageHeader
        eyebrow={<LiveClock />}
        title="Overview"
        actions={
          <Button asChild variant="soft" size="sm">
            <Link href={`${basePath}/projects?new=1`}>
              <Plus aria-hidden />
              New project
            </Link>
          </Button>
        }
      >
        Five regions serving, São Paulo running slow. {shipped} deploys shipped in the last day, and {failed} of the last 8 failed.
      </PageHeader>
      <Traffic className="mt-8" />
      <Regions className="mt-12" />
      <RecentDeployments className="mt-12" />
    </>
  );
}
