"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export type StatusLightState = "off" | "on" | "standby" | "alert" | "warning" | "error";

// The lit parts of a lamp sit in one layer over the unlit lens, so breathing and
// blinking only ever animate that layer's opacity. An LED strikes at once and
// lets go over a few frames, so the blink has a hard rise and a short tail.
const css = `
@keyframes nk-status-breathe { 0%, 100% { opacity: 0.22; } 50% { opacity: 1; } }
@keyframes nk-status-blink { 0%, 44% { opacity: 1; } 50% { opacity: 0.18; } 56%, 97% { opacity: 0.04; } 100% { opacity: 1; } }
@keyframes nk-status-ping { 0% { transform: scale(1); opacity: 0.6; } 70%, 100% { transform: scale(3); opacity: 0; } }
.nk-status-light[data-state="standby"] .nk-status-lit { animation: nk-status-breathe 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
.nk-status-light[data-state="alert"] .nk-status-lit { animation: nk-status-blink 0.62s linear infinite; }
.nk-status-ping { animation: nk-status-ping 2.2s cubic-bezier(0.23, 1, 0.32, 1) infinite; }
.nk-status-light[data-state="alert"] .nk-status-ping { animation-duration: 1.1s; }
@media (prefers-reduced-motion: reduce) {
  .nk-status-light .nk-status-lit, .nk-status-light[data-state] .nk-status-lit { animation: none; }
  .nk-status-light[data-state="standby"] .nk-status-lit { opacity: 0.6; }
  .nk-status-ping { display: none; }
}
`;

// Warning and error always read as amber and red; `color` tints the rest.
const fixedColors: Partial<Record<StatusLightState, NeonColor>> = { warning: "amber", error: "red" };

const stateWords: Record<StatusLightState, string> = {
  off: "Off",
  on: "On",
  standby: "Standby",
  alert: "Alert",
  warning: "Warning",
  error: "Error",
};

// Panel sizes are the bezel's diameter; dot sizes are the lamp's.
const sizes = {
  sm: { panel: 14, dot: 6, label: "text-[13px]", gap: "gap-2" },
  md: { panel: 18, dot: 8, label: "text-[14px]", gap: "gap-2.5" },
  lg: { panel: 24, dot: 10, label: "text-[15px]", gap: "gap-3" },
} as const;

type Variant = "panel" | "dot" | "pulse";
type Size = keyof typeof sizes;

const GroupContext = React.createContext<{ variant?: Variant; size?: Size } | null>(null);

const LIT_LENS =
  "radial-gradient(circle at 50% 58%, #fff 0 9%, color-mix(in srgb, rgb(var(--neon)) 40%, white) 24%, rgb(var(--neon)) 56%, color-mix(in srgb, rgb(var(--neon)) 62%, black) 100%)";
const UNLIT_LENS =
  "radial-gradient(circle at 50% 64%, rgb(var(--neon) / 0.3), rgb(var(--neon) / 0.12) 52%, rgb(0 0 0 / 0.55) 100%)";

function PanelLamp({ size, lit }: { size: number; lit: boolean }) {
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {/* Light thrown onto the panel around the bezel. A shadow, so it never widens the page. */}
      {lit && (
        <span className="nk-status-lit pointer-events-none absolute inset-0 rounded-full shadow-[0_0_8px_2px_rgb(var(--neon)/CALC(0.2*var(--neon-glow,1))),0_0_20px_6px_rgb(var(--neon)/CALC(0.08*var(--neon-glow,1)))]" />
      )}
      {/* Turned metal bezel */}
      <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_215deg,#666c78,#1a1c23_18%,#9298a3_40%,#23262e_58%,#5d636f_78%,#666c78)] shadow-[0_1px_1.5px_rgb(0_0_0/0.85),0_0_0_0.5px_rgb(0_0_0/0.7)]" />
      <span className="absolute inset-[13%] rounded-full bg-[#040507] shadow-[inset_0_1px_1px_rgb(0_0_0/0.95),0_0.5px_0_rgb(255_255_255/0.12)]" />
      {/* Domed lens, unlit: tinted glass with the die visible as a darker centre */}
      <span
        className="absolute inset-[21%] rounded-full shadow-[inset_0_1px_1px_rgb(0_0_0/0.75)]"
        style={{ background: UNLIT_LENS }}
      />
      {lit && (
        <span className="nk-status-lit absolute inset-0">
          <span
            className="absolute inset-[21%] rounded-full shadow-[0_0_2px_rgb(var(--neon)/var(--neon-glow,1)),0_0_6px_rgb(var(--neon)/CALC(0.85*var(--neon-glow,1))),0_0_14px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]"
            style={{ background: LIT_LENS }}
          />
          {/* Bloom caught on the inner lip of the bezel */}
          <span className="absolute inset-[11%] rounded-full shadow-[inset_0_0_2px_1px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),0_0_3px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]" />
        </span>
      )}
      {/* Specular highlight on the dome */}
      <span
        className={cn(
          "absolute left-[31%] top-[27%] h-[15%] w-[23%] -rotate-[28deg] rounded-full bg-white",
          lit ? "opacity-80" : "opacity-40",
        )}
      />
    </span>
  );
}

function DotLamp({ size, lit, pulse }: { size: number; lit: boolean; pulse: boolean }) {
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {lit && pulse && <span className="nk-status-ping absolute inset-0 rounded-full bg-[rgb(var(--neon)/0.55)]" />}
      <span className="absolute inset-0 rounded-full bg-[rgb(var(--neon)/0.22)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.18)]" />
      {lit && (
        <span
          className="nk-status-lit absolute inset-0 rounded-full shadow-[0_0_3px_rgb(var(--neon)/var(--neon-glow,1)),0_0_9px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]"
          style={{
            background:
              "radial-gradient(circle at 42% 38%, #fff 0 14%, color-mix(in srgb, rgb(var(--neon)) 42%, white) 34%, rgb(var(--neon)) 72%)",
          }}
        />
      )}
    </span>
  );
}

export interface StatusLightProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  /** What the lamp is doing. Standby breathes slowly, alert blinks fast. */
  state?: StatusLightState;
  /** `panel` is an LED in a metal bezel, `dot` a bare lamp, `pulse` a dot that rings while lit. */
  variant?: Variant;
  size?: Size;
  /** What the light belongs to: a service, a channel, a port. */
  label?: React.ReactNode;
  /** A second line under the label. */
  description?: React.ReactNode;
  /** Print the state as a word. Always on inside a StatusLightGroup unless set to false. */
  showState?: boolean;
  /** The word for the current state, e.g. "Degraded" or "Live". Also what screen readers hear. */
  stateLabel?: string;
  /** Palette name or hex for on, standby and alert. Warning is amber and error is red. */
  color?: NeonColor;
}

const StatusLight = React.forwardRef<HTMLSpanElement, StatusLightProps>(
  (
    {
      className,
      style,
      state = "on",
      variant: variantProp,
      size: sizeProp,
      label,
      description,
      showState: showStateProp,
      stateLabel,
      color,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const group = React.useContext(GroupContext);
    const variant = variantProp ?? group?.variant ?? "dot";
    const size = sizeProp ?? group?.size ?? "md";
    const showState = showStateProp ?? Boolean(group);
    const s = sizes[size];
    const lit = state !== "off";
    const word = stateLabel ?? stateWords[state];
    const tint = fixedColors[state] ?? color;
    const named = label != null || description != null;

    const lamp =
      variant === "panel" ? (
        <PanelLamp size={s.panel} lit={lit} />
      ) : (
        <DotLamp size={s.dot} lit={lit} pulse={variant === "pulse"} />
      );

    return (
      <span
        ref={ref}
        role={named ? undefined : "img"}
        aria-label={named ? ariaLabel : (ariaLabel ?? word)}
        data-state={state}
        data-variant={variant}
        style={neonVars(tint, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "nk-status-light items-center",
          group ? "flex w-full gap-3" : cn("inline-flex align-middle", s.gap),
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {/* Keeps the lamp on the first line when the label wraps */}
        <span
          aria-hidden
          className={cn("flex shrink-0 items-center justify-center", description != null && "self-start")}
          style={{ minWidth: s.panel, height: description != null ? "1.5em" : undefined }}
        >
          {lamp}
        </span>
        {named && (
          <span className={cn("min-w-0", group && "flex-1")}>
            {label != null && (
              <span className={cn("block font-medium leading-6 text-white/90", s.label)}>
                {label}
                {!showState && <span className="sr-only">, {word}</span>}
              </span>
            )}
            {description != null && <span className="block text-[13px] leading-5 text-white/55">{description}</span>}
          </span>
        )}
        {named && showState && (
          <span
            className={cn(
              "shrink-0 self-start text-[13px] leading-6",
              group && "ml-auto pl-3",
              lit ? "[color:color-mix(in_srgb,rgb(var(--neon))_72%,white)]" : "text-white/50",
            )}
          >
            {label == null && <span className="sr-only">Status: </span>}
            {word}
          </span>
        )}
      </span>
    );
  },
);
StatusLight.displayName = "StatusLight";

export interface StatusLightGroupProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "color"> {
  /** Variant for every light inside that doesn't set its own. */
  variant?: Variant;
  /** Size for every light inside that doesn't set its own. */
  size?: Size;
  /** Tints on, standby and alert lights inside. */
  color?: NeonColor;
}

/** A list of lights, one row each, with the state word aligned on the right. */
const StatusLightGroup = React.forwardRef<HTMLUListElement, StatusLightGroupProps>(
  ({ className, style, variant, size, color, children, ...props }, ref) => {
    const context = React.useMemo(() => ({ variant, size }), [variant, size]);
    return (
      <GroupContext.Provider value={context}>
        <ul
          ref={ref}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "flex w-full flex-col divide-y divide-white/[0.06]",
            className,
          )}
          {...props}
        >
          {React.Children.map(children, (child) =>
            child == null || child === false ? null : <li className="flex py-3">{child}</li>,
          )}
        </ul>
      </GroupContext.Provider>
    );
  },
);
StatusLightGroup.displayName = "StatusLightGroup";

export { StatusLight, StatusLightGroup };
