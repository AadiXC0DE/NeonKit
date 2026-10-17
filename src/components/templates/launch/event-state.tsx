"use client";

import * as React from "react";

import { event } from "./config";
import { agenda, type Slot } from "./data";

export type Phase = "before" | "live" | "after";

const DOORS = Date.parse(event.doorsAt);
const ENDS = Date.parse(event.endsAt);
const DAY = event.doorsAt.slice(0, 10);
const ZONE = event.doorsAt.slice(19);

// What "now" pretends to be when a state is forced from the URL: mid-evening
// for live, the Sunday after for after. Clocks keep ticking from there.
const SIMULATED: Record<Phase, number> = {
  before: DOORS - (3 * 86400 + 4 * 3600 + 26 * 60 + 18) * 1000,
  live: Date.parse(`${DAY}T21:41:07${ZONE}`),
  after: Date.parse(`${DAY}T10:00:00${ZONE}`) + 2 * 86400 * 1000,
};

export function phaseAt(time: number): Phase {
  if (time < DOORS) return "before";
  return time < ENDS ? "live" : "after";
}

/** A slot's local "21:30" as a timestamp on the night. */
export function slotTime(clock: string) {
  return Date.parse(`${DAY}T${clock}:00${ZONE}`);
}

export function slotStatus(slot: Slot, now: number | null): "done" | "current" | "upcoming" {
  if (now === null) return "upcoming";
  if (now >= slotTime(slot.end)) return "done";
  return now >= slotTime(slot.start) ? "current" : "upcoming";
}

/** The talk on the main stage at `now`, falling back to whatever else is running. */
export function slotAt(now: number | null) {
  const running = agenda.filter((slot) => slotStatus(slot, now) === "current");
  return running.find((slot) => slot.room === "Main hall") ?? running[0] ?? null;
}

export const doorsAt = DOORS;

type EventState = {
  phase: Phase;
  /** Milliseconds added to the real clock, so a forced state has a believable "now". */
  offset: number;
  /** True once the browser has worked out the phase. The server always renders "before". */
  ready: boolean;
};

const EventContext = React.createContext<EventState>({ phase: "before", offset: 0, ready: false });

function forcedPhase(): Phase | null {
  const value = new URLSearchParams(window.location.search).get("state");
  return value === "before" || value === "live" || value === "after" ? value : null;
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<EventState>({ phase: "before", offset: 0, ready: false });

  React.useEffect(() => {
    const forced = forcedPhase();
    const real = Date.now();
    const offset = forced && phaseAt(real) !== forced ? SIMULATED[forced] - real : 0;
    const sync = () => {
      const phase = phaseAt(Date.now() + offset);
      setState((prev) => (prev.ready && prev.phase === phase && prev.offset === offset ? prev : { phase, offset, ready: true }));
    };
    sync();
    // Only the phase lives here, so the page re-renders when doors open or the stream ends, not every second.
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <EventContext.Provider value={state}>{children}</EventContext.Provider>;
}

export function useEvent() {
  return React.useContext(EventContext);
}

/** The event's idea of now, ticking every `every` ms. Null until mounted, so nothing time-based renders on the server. */
export function useNow(every = 1000) {
  const { offset, ready } = useEvent();
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!ready) return;
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = window.setInterval(tick, every);
    return () => window.clearInterval(id);
  }, [offset, ready, every]);

  return now;
}
