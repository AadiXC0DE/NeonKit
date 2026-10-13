import { CalendarDays, GitPullRequest, MapPin } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const people = {
  mara: {
    name: "Mara Okafor",
    role: "Design engineer",
    bio: "Builds the parts of Northlight you click on. Currently rebuilding the deploy timeline.",
    place: "Lisbon",
    joined: "Joined March 2021",
  },
  jonas: {
    name: "Jonas Weber",
    role: "Staff engineer, Edge",
    bio: "Keeps cold starts under 50 ms. Will review your cache headers whether you ask or not.",
    place: "Berlin",
    joined: "Joined June 2019",
  },
};

function Mention({ handle }: { handle: keyof typeof people }) {
  const person = people[handle];
  return (
    <HoverCard>
      <HoverCardTrigger href={`#${handle}`}>@{handle}</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start gap-3">
          <Avatar alt={person.name} size="lg" status="online" />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-sm font-medium text-white/90">{person.name}</p>
            <p className="truncate text-xs leading-5 text-white/50">
              @{handle} · {person.role}
            </p>
          </div>
          <Button size="sm" variant="soft">
            Follow
          </Button>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/65">{person.bio}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <MapPin aria-hidden className="size-3.5" /> {person.place}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-3.5" /> {person.joined}
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCardDemo() {
  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="flex items-center gap-2 text-xs text-white/40">
        <GitPullRequest aria-hidden className="size-3.5 text-[rgb(var(--neon))]" />
        Pull request #482 · Merged
      </p>
      <p className="mt-1.5 text-sm font-medium text-white/85">Warm the edge cache before promoting a deployment</p>
      <p className="mt-3 text-sm leading-6 text-white/55">
        Approved by <Mention handle="mara" /> and <Mention handle="jonas" /> two hours ago.
      </p>
    </div>
  );
}
