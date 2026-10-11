import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export default function TooltipDisabled() {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost">Save draft</Button>
      <Tooltip content="Add a title before publishing">
        {/* Disabled buttons ignore the pointer and can't take focus, so the span does both. */}
        <span
          tabIndex={0}
          className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          <Button variant="solid" disabled>
            Publish
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
