"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timeline, TimelineItem, type TimelineStatus } from "@/components/ui/timeline";

const events = [
  { title: "Order placed", time: "Oct 9, 10:24", detail: "Order #48213 · 2 items" },
  { title: "Packed", time: "Oct 9, 16:02", detail: "Left the Rotterdam fulfilment center." },
  { title: "In transit", time: "Oct 10, 07:45", detail: "Arrived at the Antwerp sorting hub." },
  { title: "Out for delivery", time: "Oct 11, 08:10", detail: "With your courier. Usually arrives by 13:00." },
  { title: "Delivered", time: "Oct 11, 11:38", detail: "Left with the building reception." },
];

function statusOf(index: number, current: number): TimelineStatus {
  if (index < current) return "done";
  if (index === current) return current === events.length - 1 ? "done" : "current";
  return "upcoming";
}

export default function TimelineLive() {
  const [current, setCurrent] = React.useState(2);
  const delivered = current === events.length - 1;

  return (
    <div className="grid w-full max-w-sm gap-6">
      <Timeline>
        {events.map((event, index) => {
          const status = statusOf(index, current);
          return (
            <TimelineItem
              key={event.title}
              status={status}
              title={event.title}
              time={status === "upcoming" ? undefined : event.time}
            >
              {status === "upcoming" ? null : event.detail}
            </TimelineItem>
          );
        })}
      </Timeline>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="soft"
          disabled={delivered}
          onClick={() => setCurrent((step) => Math.min(step + 1, events.length - 1))}
        >
          Next tracking update
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCurrent(0)}>
          <RotateCcw /> Reset
        </Button>
      </div>
    </div>
  );
}
