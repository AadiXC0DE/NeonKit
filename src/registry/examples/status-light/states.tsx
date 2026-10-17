import { StatusLight, type StatusLightState } from "@/components/ui/status-light";

const states: StatusLightState[] = ["off", "on", "standby", "alert", "warning", "error"];
const variants = ["dot", "pulse", "panel"] as const;

export default function StatusLightStates() {
  return (
    <div className="grid w-full max-w-[640px] grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-x-4 gap-y-4 sm:gap-x-6 text-[13px] text-white/55">
      <span />
      {variants.map((variant) => (
        <span key={variant} className="text-white/70">
          {variant[0].toUpperCase() + variant.slice(1)}
        </span>
      ))}
      {states.map((state) => (
        <div key={state} className="contents">
          <span className="pr-2 text-white/70">{state[0].toUpperCase() + state.slice(1)}</span>
          {variants.map((variant) => (
            <span key={variant} className="flex items-center gap-4">
              <StatusLight state={state} variant={variant} size="sm" className="max-sm:hidden" />
              <StatusLight state={state} variant={variant} />
              <StatusLight state={state} variant={variant} size="lg" className="max-sm:hidden" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
