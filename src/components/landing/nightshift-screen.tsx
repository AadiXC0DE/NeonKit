"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { GlowChart } from "@/components/ui/glow-chart";
import { Kbd } from "@/components/ui/kbd";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import type { PartKey } from "./parts";

/** p95 latency over the last day, one point an hour. */
const latency = [
  148, 151, 139, 136, 142, 131, 128, 133, 141, 156, 171, 168, 159, 162, 177, 194, 183, 166, 158, 149, 146, 152, 144, 142,
].map((y, x) => ({ x: `${String(x).padStart(2, "0")}:00`, y }));

const deploys = [
  { sha: "a81c3e0", message: "Cache edge config for 60s", branch: "main", status: "Building", time: "0:41", age: "now" },
  { sha: "4f2a91c", message: "Move image resize to the worker", branch: "main", status: "Ready", time: "1:12", age: "2h" },
  { sha: "9be07d4", message: "Drop the legacy auth cookie", branch: "ana/cookies", status: "Ready", time: "1:05", age: "5h" },
  { sha: "e3d5a12", message: "Bump next to 16.0.3", branch: "main", status: "Ready", time: "1:31", age: "yesterday" },
  { sha: "71c0f8b", message: "Retry webhooks with jitter", branch: "kim/retries", status: "Failed", time: "0:22", age: "yesterday" },
];

const nav = ["Overview", "Deployments", "Logs", "Domains", "Settings"];

type PartProps = {
  lit: (key: PartKey) => boolean;
  strike: number;
  register: (key: PartKey) => (node: HTMLElement | null) => void;
};

/** Wraps one lightable part of the screen. */
function Part({
  id,
  lit,
  strike,
  register,
  index,
  anchor = true,
  className,
  children,
}: PartProps & { id: PartKey; index: number; anchor?: boolean; className?: string; children: React.ReactNode }) {
  const on = lit(id);
  return (
    <div
      ref={anchor ? register(id) : undefined}
      data-part={id}
      key={on ? `on-${strike}` : "off"}
      className={cn(!on && "nk-unlit", on && strike > 0 && "nk-strike", className)}
      style={on && strike > 0 ? { animationDelay: `${index * 110}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function Dot({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px]">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "Ready" && "bg-[#5d6577]",
          status === "Failed" && "bg-[#b5525d]",
          status === "Building" && "bg-white/70",
        )}
      />
      <span className={status === "Failed" ? "text-[#d0a0a6]" : "text-white/70"}>{status}</span>
    </span>
  );
}

function deploy() {
  toast.promise(new Promise((resolve) => setTimeout(resolve, 1800)), {
    loading: "Deploying a81c3e0 to production",
    success: "Live on nightshift.dev in 41s",
    error: "Deploy failed",
  });
}

function Palette() {
  return (
    <Command label="Command palette" className="w-full">
      <CommandInput placeholder="Type a command" />
      <CommandList className="max-h-none">
        <CommandGroup heading="Actions">
          <CommandItem value="deploy main" shortcut={["⌘", "⇧", "D"]}>
            Deploy main to production
          </CommandItem>
          <CommandItem value="preview">Create preview from branch</CommandItem>
          <CommandItem value="rollback">Roll back to 4f2a91c</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/** The console at 980 by 590, scaled by its parent below that width. */
export function DesktopScreen(props: PartProps) {
  const [selected, setSelected] = React.useState(1);
  return (
    <div className="relative flex h-[590px] w-[980px] overflow-hidden rounded-[14px] border border-white/[0.09] bg-[#090b10] text-left shadow-[0_50px_120px_-40px_rgb(0_0_0/0.9)]">
      {/* Sidebar */}
      <div className="flex w-[196px] shrink-0 flex-col border-r border-white/[0.06] bg-[#07080c] px-3 py-4">
        <div className="flex items-center gap-2.5 px-2">
          <span aria-hidden className="grid size-6 place-items-center rounded-md bg-white/[0.08] text-[11px] font-semibold text-white/80">
            N
          </span>
          <span className="text-[14px] font-medium text-white/90">Nightshift</span>
        </div>
        <div className="mt-6 flex flex-col gap-0.5">
          {nav.map((item) => (
            <span
              key={item}
              className={cn(
                "rounded-md px-2 py-1.5 text-[13.5px]",
                item === "Deployments" ? "bg-white/[0.06] text-white/90" : "text-white/50",
              )}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-auto border-t border-white/[0.06] px-2 pt-4">
          <p className="text-[12px] text-white/55">Production</p>
          <div className="mt-2 flex items-center gap-2.5">
            <Part {...props} id="live" index={4}>
              <Badge dot pulse size="sm">
                Live
              </Badge>
            </Part>
            <span className="truncate text-[13px] text-white/80">nightshift.dev</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center gap-3 border-b border-white/[0.06] px-6">
          <span className="text-[13px] text-white/55">web</span>
          <span aria-hidden className="text-white/20">/</span>
          <span className="text-[13px] text-white/80">Deployments</span>
          <span className="ml-auto flex h-8 w-56 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] pl-3 pr-1.5 text-[13px] text-white/50">
            Search
            <Kbd size="sm" className="ml-auto">
              ⌘K
            </Kbd>
          </span>
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-[#1b1f2a] text-[11px] text-white/70">
            AO
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 pt-6">
          <div className="flex items-start gap-4">
            <div>
              <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-white/95">Deployments</h3>
              <p className="mt-1 text-[13px] text-white/55">
                web · production · served from iad1 and fra1
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" tabIndex={-1}>
                Roll back
              </Button>
              <Part {...props} id="action" index={3}>
                <Button variant="solid" size="sm" onClick={deploy}>
                  Deploy main
                </Button>
              </Part>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-[13px] text-white/55">p95 latency, last 24 hours</span>
              <span className="font-mono text-[13px] tabular-nums text-white/85">142 ms</span>
            </div>
            <Part {...props} id="chart" index={1} className="mt-2 w-[360px]">
              <GlowChart
                data={latency}
                type="area"
                height={128}
                axis={false}
                grid={false}
                tooltip={false}
                label="p95 latency, last 24 hours"
                yDomain={[100, 210]}
              />
            </Part>
          </div>

          <Part {...props} id="row" index={2} anchor={false} className="-mx-6">
          <Table density="compact" containerClassName="rounded-none border-x-0 border-b-0 border-white/[0.06] bg-transparent">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Commit</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Took</TableHead>
                <TableHead align="right" className="pr-6">
                  When
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deploys.map((d, i) => {
                return (
                  <TableRow
                    key={d.sha}
                    ref={i === selected ? props.register("row") : undefined}
                    selected={i === selected}
                    interactive
                    onClick={() => setSelected(i)}
                  >
                    <TableCell className="pl-6">
                      <span className="mr-3 font-mono text-[12px] text-white/50">{d.sha}</span>
                      <span className="text-white/85">{d.message}</span>
                    </TableCell>
                    <TableCell className="text-white/55">{d.branch}</TableCell>
                    <TableCell>
                      <Dot status={d.status} />
                    </TableCell>
                    <TableCell align="right" className="font-mono text-[12px] tabular-nums text-white/55">
                      {d.time}
                    </TableCell>
                    <TableCell align="right" className="pr-6 text-white/55">
                      {d.age}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </Part>
        </div>

        {/* The palette, open over the right of the page */}
        <Part
          {...props}
          id="palette"
          index={0}
          className="absolute right-6 top-[124px] w-[340px] rounded-xl shadow-[0_30px_80px_-20px_rgb(0_0_0/0.95),0_0_0_1px_rgb(0_0_0/0.6)]"
        >
          <Palette />
        </Part>
      </div>
    </div>
  );
}

/** The same product as a phone app. */
export function PhoneScreen(props: PartProps) {
  const [selected, setSelected] = React.useState(1);
  return (
    <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#090b10] text-left shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]">
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <span className="text-[13px] text-white/55">web</span>
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-[#1b1f2a] text-[11px] text-white/70">
          AO
        </span>
      </div>
      <div className="px-5">
        <div className="flex items-center gap-3">
          <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-white/95">Production</h3>
          <Part {...props} id="live" index={4}>
            <Badge dot pulse size="sm">
              Live
            </Badge>
          </Part>
        </div>
        <p className="mt-1 text-[13px] text-white/55">nightshift.dev · iad1, fra1</p>

        <Part {...props} id="palette" index={0} className="mt-5">
          <Palette />
        </Part>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-[13px] text-white/55">p95 latency</span>
          <span className="font-mono text-[13px] tabular-nums text-white/85">142 ms</span>
        </div>
        <Part {...props} id="chart" index={1} className="mt-2">
          <GlowChart
            data={latency}
            type="area"
            height={96}
            axis={false}
            grid={false}
            tooltip={false}
            label="p95 latency, last 24 hours"
            yDomain={[100, 210]}
          />
        </Part>
      </div>

      <Part {...props} id="row" index={2} anchor={false} className="mt-4">
        <Table density="compact" containerClassName="rounded-none border-x-0 border-b-0 border-white/[0.06] bg-transparent">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Commit</TableHead>
              <TableHead align="right" className="pr-5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deploys.slice(0, 3).map((d, i) => (
              <TableRow
                key={d.sha}
                ref={i === selected ? props.register("row") : undefined}
                selected={i === selected}
                interactive
                onClick={() => setSelected(i)}
              >
                <TableCell className="max-w-0 pl-5">
                  <span className="block truncate text-white/85">{d.message}</span>
                  <span className="mt-0.5 block font-mono text-[11.5px] text-white/50">
                    {d.sha} · {d.branch}
                  </span>
                </TableCell>
                <TableCell align="right" className="pr-5">
                  <Dot status={d.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Part>

      <div className="p-5">
        <Part {...props} id="action" index={3}>
          <Button variant="solid" className="w-full" onClick={deploy}>
            Deploy main
          </Button>
        </Part>
      </div>
    </div>
  );
}
