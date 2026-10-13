"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { basePath } from "../config";
import { DEPLOYMENTS, metricSeries, summarize } from "../data";
import { PageHeader } from "../parts/page-header";
import { RecentDeployments } from "./deployments";
import { LiveClock } from "./live-clock";
import { Regions, type Drain } from "./regions";
import { Traffic } from "./traffic";

const shipped = summarize("deploys", metricSeries("deploys", "24h").current.map((p) => p.y));
const failed = DEPLOYMENTS.filter((d) => d.status === "failed").length;

// Amber is the one warning color on the console. It reads as light, so it gets a faint halo.
const amber = "text-[rgb(251_191_36)] [text-shadow:0_0_18px_rgb(251_191_36/0.35)]";

export function Overview() {
  // São Paulo's state lives here so the headline and the region board tell the same story.
  const [drain, setDrain] = React.useState<Drain>("none");

  return (
    <>
      <PageHeader
        title={
          <>
            Five regions healthy.{" "}
            {drain === "drained" ? (
              <span className="text-white/50">São Paulo is drained.</span>
            ) : (
              <span className={amber}>São Paulo is slow.</span>
            )}
          </>
        }
        status={<LiveClock />}
        actions={
          <Button asChild variant="ghost" size="sm" className="border border-white/10 text-white/80 hover:text-white">
            <Link href={`${basePath}/projects?new=1`}>
              <Plus aria-hidden />
              New project
            </Link>
          </Button>
        }
      >
        {shipped} deploys shipped in the last day and {failed} of the last eight failed.{" "}
        {drain === "drained"
          ? "Ashburn is serving São Paulo's traffic until you bring it back."
          : "Every São Paulo request is still answered, just slower than the 60 ms we promise."}
      </PageHeader>

      <Traffic className="mt-12 sm:mt-14" />

      <div className="mt-16 grid gap-16 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-12">
        <Regions drain={drain} onDrainChange={setDrain} />
        <RecentDeployments />
      </div>
    </>
  );
}
