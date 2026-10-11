import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

const nudges = [
  { side: "top", label: "Nudge up", key: "↑", icon: ArrowUp, cell: "col-start-2 row-start-1" },
  { side: "left", label: "Nudge left", key: "←", icon: ArrowLeft, cell: "col-start-1 row-start-2" },
  { side: "right", label: "Nudge right", key: "→", icon: ArrowRight, cell: "col-start-3 row-start-2" },
  { side: "bottom", label: "Nudge down", key: "↓", icon: ArrowDown, cell: "col-start-2 row-start-3" },
] as const;

export default function TooltipSides() {
  return (
    <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-1.5">
      <span
        aria-hidden
        className="col-start-2 row-start-2 size-9 rounded-lg border border-dashed border-white/20 bg-white/[0.03]"
      />
      {nudges.map(({ side, label, key, icon: Icon, cell }) => (
        <div key={side} className={cell}>
          <Tooltip
            side={side}
            content={
              <span className="flex items-center gap-2">
                {label}
                <kbd className="font-sans text-white/45">{key}</kbd>
              </span>
            }
          >
            <Button variant="ghost" size="icon" aria-label={label} className="size-9">
              <Icon />
            </Button>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
