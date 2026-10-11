"use client";

import * as React from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ranges = {
  day: { period: "Today", deploys: "42", change: "+8% on yesterday" },
  week: { period: "This week", deploys: "286", change: "+14% on last week" },
  month: { period: "This month", deploys: "1,204", change: "−3% on last month" },
} as const;

type Range = keyof typeof ranges;

export default function ToggleGroupDemo() {
  const [range, setRange] = React.useState<Range>("week");
  const [marks, setMarks] = React.useState<string[]>(["bold"]);
  const [align, setAlign] = React.useState("left");
  const stats = ranges[range];

  const decoration = [marks.includes("underline") && "underline", marks.includes("strike") && "line-through"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid w-full max-w-md gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-0.5">
          <p className="text-xs text-white/45">{stats.period}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-[-0.01em] text-white/90">
            {stats.deploys} <span className="text-sm font-normal text-white/45">deploys</span>
          </p>
          <p className="text-xs text-white/45">{stats.change}</p>
        </div>
        <ToggleGroup aria-label="Range" value={range} onValueChange={(value) => setRange(value as Range)}>
          <ToggleGroupItem value="day">Day</ToggleGroupItem>
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 p-1.5">
          <ToggleGroup
            type="multiple"
            variant="ghost"
            size="sm"
            aria-label="Text formatting"
            value={marks}
            onValueChange={setMarks}
          >
            <ToggleGroupItem value="bold" aria-label="Bold">
              <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <Underline />
            </ToggleGroupItem>
            <ToggleGroupItem value="strike" aria-label="Strikethrough">
              <Strikethrough />
            </ToggleGroupItem>
            <ToggleGroupItem value="code" aria-label="Code">
              <Code />
            </ToggleGroupItem>
          </ToggleGroup>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-white/10" />
          <ToggleGroup variant="ghost" size="sm" aria-label="Alignment" value={align} onValueChange={setAlign}>
            <ToggleGroupItem value="left" aria-label="Align left">
              <AlignLeft />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
              <AlignCenter />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
              <AlignRight />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <p
          style={{ textAlign: align as React.CSSProperties["textAlign"], textDecorationLine: decoration || "none" }}
          className={cn(
            "px-4 py-5 text-sm leading-6 text-white/75 transition-[color] duration-150",
            marks.includes("bold") && "font-semibold text-white/90",
            marks.includes("italic") && "italic",
            marks.includes("code") && "font-mono text-[13px]",
          )}
        >
          Release notes go out with the 2.4 build on Thursday. Flag anything that should wait for 2.5.
        </p>
      </div>
    </div>
  );
}
