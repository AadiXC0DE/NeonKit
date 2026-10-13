import { AtSign, Bell, BellOff, CalendarDays, Tag, Users } from "@/components/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ToggleGroupVertical() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="grid gap-2">
        <p id="notify-label" className="text-xs font-medium text-white/50">
          Notify me about
        </p>
        <ToggleGroup orientation="vertical" aria-labelledby="notify-label" defaultValue="mentions" className="w-48">
          <ToggleGroupItem value="all">
            <Bell />
            All activity
          </ToggleGroupItem>
          <ToggleGroupItem value="mentions">
            <AtSign />
            Mentions only
          </ToggleGroupItem>
          <ToggleGroupItem value="none">
            <BellOff />
            Nothing
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="grid gap-2">
        <p id="card-fields-label" className="text-xs font-medium text-white/50">
          Show on cards
        </p>
        <ToggleGroup
          type="multiple"
          variant="outline"
          orientation="vertical"
          aria-labelledby="card-fields-label"
          defaultValue={["assignee", "due"]}
          className="w-48"
        >
          <ToggleGroupItem value="assignee">
            <Users />
            Assignee
          </ToggleGroupItem>
          <ToggleGroupItem value="due">
            <CalendarDays />
            Due date
          </ToggleGroupItem>
          <ToggleGroupItem value="labels">
            <Tag />
            Labels
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
