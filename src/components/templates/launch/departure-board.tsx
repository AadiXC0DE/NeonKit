"use client";

import { SplitFlap } from "@/components/ui/split-flap";
import { cn } from "@/lib/utils";

import { agenda, replay } from "./data";
import { doorsAt, slotAt, useEvent, useNow, type Phase } from "./event-state";

const STATUS: Record<Phase, string> = {
  before: "NOW BOARDING",
  live: " ON AIR NOW",
  after: "REPLAY READY",
};

const CAPTION: Record<Phase, string> = {
  before: "Doors open in",
  live: "On air for",
  after: "Replay runtime",
};

const UNITS: Record<Phase, [string, string, string, string]> = {
  before: ["days", "hrs", "min", "sec"],
  live: ["session", "hrs", "min", "sec"],
  after: ["sessions", "hrs", "min", "sec"],
};

const filmed = agenda.filter((slot) => slot.room === "Main hall");
const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function readout(phase: Phase, now: number | null): [string, string, string, string] {
  if (now === null) return ["", "", "", ""];
  // Set like the live readout ("5/8"), so the board never shows two blank flaps in front of the count.
  if (phase === "after") return [`${replay.talks}/${filmed.length}`, "04", "12", "38"];
  const seconds = Math.max(0, Math.floor(Math.abs(now - doorsAt) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (phase === "live") {
    const slot = slotAt(now);
    const index = slot ? filmed.indexOf(slot) + 1 : 0;
    return [index > 0 ? `${index}/${filmed.length}` : "INT", pad(h), pad(m), pad(s)];
  }
  return [String(Math.floor(h / 24)).padStart(3, "0"), pad(h % 24), pad(m), pad(s)];
}

function Lamp({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 rounded-full transition-[background-color,box-shadow] duration-300",
        lit
          ? "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.7)]"
          : "bg-white/15",
      )}
    />
  );
}

const label = "flex items-center gap-2 text-[13px] text-white/60";

/** The split-flap board in the hero: status on top, the countdown to doors (or the night's clock) under it. */
export function DepartureBoard({ className }: { className?: string }) {
  const { phase, ready } = useEvent();
  const now = useNow(1000);
  const shown: Phase = ready ? phase : "before";
  const values = readout(shown, now);
  const units = UNITS[shown];
  const local = now === null ? "--:--" : clock.format(now);

  return (
    <div
      className={cn(
        "relative isolate rounded-[18px] border border-white/10 bg-[linear-gradient(to_bottom,#0e0f15,#08090d)] p-4 [--board-h:31px] sm:p-7 sm:[--board-h:56px] xl:[--board-h:60px]",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_0_0_1px_rgb(0_0_0/0.6),0_50px_100px_-40px_rgb(0_0_0)]",
        className,
      )}
    >
      {/* The two hangers it's bolted to. */}
      <span aria-hidden className="absolute -top-12 left-[18%] -z-10 hidden h-12 w-px bg-[linear-gradient(transparent,rgb(255_255_255/0.14))] lg:block" />
      <span aria-hidden className="absolute -top-12 right-[18%] -z-10 hidden h-12 w-px bg-[linear-gradient(transparent,rgb(255_255_255/0.14))] lg:block" />
      {/* Light from the flaps washing over the housing. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(ellipse_80%_55%_at_50%_35%,rgb(var(--neon)/0.08),transparent_75%)]"
      />

      <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-3 text-[13px] text-white/60 sm:pb-4">
        <span>
          Gate K<span className="hidden sm:inline">, Wolfraamhal</span>
        </span>
        <span>
          Rotterdam <span className="font-mono tabular-nums text-white/90">{local}</span>
        </span>
      </div>

      <div className="mt-4 sm:mt-6">
        <p className={label}>
          <Lamp lit={now !== null} />
          Status
        </p>
        <SplitFlap
          value={now === null ? "" : STATUS[shown]}
          length={12}
          charset="letters"
          flipDuration={60}
          stagger={40}
          className="mt-2.5 [--flap-h:var(--board-h)] sm:mt-3"
        />
      </div>

      <div className="mt-5 sm:mt-7">
        <p className={label}>
          <Lamp lit={now !== null && shown === "live"} />
          {CAPTION[shown]}
        </p>
        <div role="timer" aria-live="off" className="mt-2.5 flex items-start gap-[calc(var(--flap-h)*0.32)] [--flap-h:calc(var(--board-h)*1.2)] sm:mt-3">
          {values.map((value, index) => (
            <div key={units[index]} className="grid gap-2">
              <SplitFlap
                value={value}
                length={index === 0 ? 3 : 2}
                align="right"
                charset={index === 0 && shown !== "before" ? "alphanumeric" : "numeric"}
                flipDuration={55}
                stagger={35}
              />
              <span className="text-[12px] text-white/55">{units[index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
