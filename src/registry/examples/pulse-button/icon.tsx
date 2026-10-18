import { Bell, Mic } from "@/components/ui/icons";
import { PulseButton } from "@/components/ui/pulse-button";

export default function PulseButtonIcon() {
  return (
    <div className="flex items-center gap-8">
      <PulseButton size="icon" variant="outline" rings={1} aria-label="Notifications, 3 unread">
        <Bell />
      </PulseButton>
      <PulseButton size="icon" color="red" period={1.4} aria-label="Stop recording">
        <Mic />
      </PulseButton>
    </div>
  );
}
