import { HoldButton } from "@/components/ui/hold-button";

export default function HoldButtonDurations() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <HoldButton duration={700} completeLabel="Archived">
        Archive · 0.7s
      </HoldButton>
      <HoldButton completeLabel="Sent">Send · 1.5s</HoldButton>
      <HoldButton duration={3000} completeLabel="Rotated">
        Rotate keys · 3s
      </HoldButton>
    </div>
  );
}
