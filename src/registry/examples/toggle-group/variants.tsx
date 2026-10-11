import { Globe, LayoutGrid, List, Lock, SquareKanban, Users } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const row = "grid gap-2";
const caption = "text-xs font-medium text-white/45";

export default function ToggleGroupVariants() {
  return (
    <div className="grid gap-6">
      <div className={row}>
        <p className={caption}>Segmented</p>
        <ToggleGroup aria-label="Layout" defaultValue="board">
          <ToggleGroupItem value="list">
            <List />
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="board">
            <SquareKanban />
            Board
          </ToggleGroupItem>
          <ToggleGroupItem value="grid">
            <LayoutGrid />
            Grid
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className={row}>
        <p className={caption}>Outline</p>
        <ToggleGroup variant="outline" aria-label="Visibility" defaultValue="team">
          <ToggleGroupItem value="private">
            <Lock />
            Private
          </ToggleGroupItem>
          <ToggleGroupItem value="team">
            <Users />
            Team
          </ToggleGroupItem>
          <ToggleGroupItem value="public">
            <Globe />
            Public
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className={row}>
        <p className={caption}>Ghost, multiple</p>
        <ToggleGroup type="multiple" variant="ghost" aria-label="Weekdays" defaultValue={["mon", "wed", "fri"]}>
          {["mon", "tue", "wed", "thu", "fri"].map((day) => (
            <ToggleGroupItem key={day} value={day} className="capitalize">
              {day}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
