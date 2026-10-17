"use client";

import * as React from "react";
import { Laptop, Server } from "@/components/ui/icons";
import { SignalBeam } from "@/components/ui/signal-beam";

const rows = [
  { label: "POST /v1/events", note: "default", props: {} },
  { label: "Server-sent events", note: "reverse", props: { reverse: true } },
  { label: "WebSocket", note: "bidirectional", props: { bidirectional: true, duration: 1.6, repeatDelay: 0.6 } },
];

function Node({ children, nodeRef }: { children: React.ReactNode; nodeRef: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <span
      ref={nodeRef}
      className="relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#0b0d14] text-white/75 [&_svg]:size-[18px]"
    >
      {children}
    </span>
  );
}

function Row({ label, note, props }: (typeof rows)[number]) {
  const container = React.useRef<HTMLDivElement>(null);
  const client = React.useRef<HTMLSpanElement>(null);
  const server = React.useRef<HTMLSpanElement>(null);
  return (
    <div ref={container} className="relative flex items-center gap-4">
      <Node nodeRef={client}>
        <Laptop />
      </Node>
      <div className="flex-1 pb-9 text-center">
        <span className="text-[13px] text-white/80">{label}</span>
        <span className="ml-2 font-mono text-[11px] text-white/40">{note}</span>
      </div>
      <Node nodeRef={server}>
        <Server />
      </Node>
      <SignalBeam containerRef={container} fromRef={client} toRef={server} {...props} />
    </div>
  );
}

export default function SignalBeamDirections() {
  return (
    <div className="grid w-full max-w-md gap-7">
      {rows.map((row) => (
        <Row key={row.label} {...row} />
      ))}
    </div>
  );
}
