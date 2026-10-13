import { Avatar } from "@/components/ui/avatar";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80`;

const team = [
  { name: "Maya Okafor", role: "Design engineer", src: photo("1494790108377-be9c29b29330"), status: "online", note: "Online" },
  { name: "Daniel Reyes", role: "Platform lead", src: photo("1500648767791-00dcc994a43e"), status: "busy", note: "In a meeting" },
  { name: "Lena Fischer", role: "Product designer", src: photo("1438761681033-6461ffad8d80"), status: "away", note: "Away 20m" },
  { name: "Arjun Mehta", role: "Frontend engineer", src: undefined, status: "offline", note: "Seen 3h ago" },
] as const;

export default function AvatarDemo() {
  return (
    <ul className="grid w-full max-w-sm gap-1">
      {team.map((member) => (
        <li key={member.name} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]">
          <Avatar src={member.src} alt={member.name} status={member.status} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/90">{member.name}</p>
            <p className="truncate text-xs text-white/50">{member.role}</p>
          </div>
          <span className="shrink-0 text-xs text-white/40">{member.note}</span>
        </li>
      ))}
    </ul>
  );
}
