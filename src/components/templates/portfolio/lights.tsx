"use client";

import * as React from "react";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { neonVars } from "@/lib/neon";
import { color } from "./config";

/** What the accent becomes with the lights off: plain glass, no color left in the room. */
export const UNLIT = "#8f949f";

type LightsContextValue = {
  on: boolean;
  setOn: (on: boolean) => void;
  toggle: () => void;
};

const LightsContext = React.createContext<LightsContextValue | null>(null);

export function useLights() {
  const context = React.useContext(LightsContext);
  if (!context) throw new Error("useLights must be used inside <Lights>.");
  return context;
}

// The room lights stutter as they change: two dips, then they hold. Kept well
// under three flashes a second, and dropped entirely for reduced motion.
const css = `
@keyframes nk-portfolio-lights-on { 0% { opacity: 0.6 } 10% { opacity: 0.05 } 18% { opacity: 0.45 } 30% { opacity: 0 } 40% { opacity: 0.22 } 56%, 100% { opacity: 0 } }
@keyframes nk-portfolio-lights-off { 0% { opacity: 0 } 14% { opacity: 0.5 } 22% { opacity: 0.08 } 38% { opacity: 0.42 } 50%, 100% { opacity: 0 } }
.nk-portfolio-dip-on { animation: nk-portfolio-lights-on 700ms linear both; }
.nk-portfolio-dip-off { animation: nk-portfolio-lights-off 520ms linear both; }
@media (prefers-reduced-motion: reduce) { .nk-portfolio-dip-on, .nk-portfolio-dip-off { animation: none; opacity: 0; } }
`;

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || Boolean(target.closest("input, textarea, select, [role='textbox']"));
}

/**
 * The page's light switch. Wraps everything, sets the color once, and swaps the
 * accent for unlit glass when the lights go off. Signs read `on` from useLights().
 */
export function Lights({ children }: { children: React.ReactNode }) {
  const [on, setOnState] = React.useState(true);
  // Each switch remounts the dip overlay so its stutter replays.
  const [switches, setSwitches] = React.useState(0);

  const setOn = React.useCallback(
    (next: boolean) => {
      if (next === on) return;
      setOnState(next);
      setSwitches((count) => count + 1);
    },
    [on],
  );
  const toggle = React.useCallback(() => setOn(!on), [on, setOn]);

  // "L" flips the lights from anywhere on the page, unless you're typing.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() !== "l" || isTyping(event.target)) return;
      if (document.querySelector("dialog[open]")) return;
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const value = React.useMemo(() => ({ on, setOn, toggle }), [on, setOn, toggle]);

  return (
    <LightsContext.Provider value={value}>
      <div
        data-lights={on ? "on" : "off"}
        style={neonVars(on ? color : UNLIT)}
        className="relative isolate min-h-screen overflow-x-clip bg-[#05060a] text-white antialiased selection:bg-[rgb(var(--neon)/0.3)]"
      >
        <style>{css}</style>
        {children}
        {/* With the room dark, the pointer carries a small torch. */}
        {!on && <CursorGlow target="window" color="#fff4dc" size={560} intensity={0.55} />}
        {switches > 0 && (
          <div
            key={switches}
            aria-hidden
            className={`pointer-events-none fixed inset-0 z-[70] bg-black ${on ? "nk-portfolio-dip-on" : "nk-portfolio-dip-off"}`}
          />
        )}
      </div>
    </LightsContext.Provider>
  );
}
