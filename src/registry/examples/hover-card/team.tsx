import { Clock } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const team = [
  { handle: "priya", name: "Priya Raman", role: "Product lead", city: "Bengaluru", time: "18:02", status: "online" },
  { handle: "jonas", name: "Jonas Weber", role: "Staff engineer", city: "Berlin", time: "14:32", status: "busy" },
  { handle: "ines", name: "Inês Duarte", role: "Brand designer", city: "Porto", time: "13:32", status: "away" },
  { handle: "sam", name: "Sam Whitaker", role: "Support", city: "Toronto", time: "08:32", status: "offline" },
] as const;

const statusLabel = { online: "Available", busy: "In a meeting", away: "Away", offline: "Offline" };

export default function HoverCardTeam() {
  return (
    <ul className="grid w-full max-w-60 gap-1">
      {team.map((person) => (
        <li key={person.handle} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <Avatar alt={person.name} size="sm" status={person.status} />
          <HoverCard openDelay={250} closeDelay={150}>
            <HoverCardTrigger href={`#${person.handle}`} className="text-sm no-underline hover:underline">
              {person.name}
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" sideOffset={14} className="w-64">
              <p className="text-sm font-medium text-white/90">{person.name}</p>
              <p className="text-xs leading-5 text-white/50">
                {person.role} · {person.city}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-white/55">
                <span className="flex items-center gap-1.5">
                  <Clock aria-hidden className="size-3.5 text-white/40" />
                  {person.time} local time
                </span>
                <span>{statusLabel[person.status]}</span>
              </div>
            </HoverCardContent>
          </HoverCard>
        </li>
      ))}
    </ul>
  );
}
