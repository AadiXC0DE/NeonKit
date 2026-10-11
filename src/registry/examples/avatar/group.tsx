import { Avatar, AvatarGroup } from "@/components/ui/avatar";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80`;

const editors = [
  { name: "Maya Okafor", src: photo("1494790108377-be9c29b29330") },
  { name: "Daniel Reyes", src: photo("1500648767791-00dcc994a43e") },
  { name: "Lena Fischer", src: photo("1438761681033-6461ffad8d80") },
  { name: "Tom Becker", src: photo("1472099645785-5658abf4ff4e") },
  { name: "Sofia Marin", src: photo("1517841905240-472988babdf9") },
  { name: "Noah Kim", src: photo("1519244703995-f4e0f30006d5") },
  { name: "Arjun Mehta", src: undefined },
];

export default function AvatarGroupExample() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-3">
        <AvatarGroup max={4}>
          {editors.map((person) => (
            <Avatar key={person.name} src={person.src} alt={person.name} />
          ))}
        </AvatarGroup>
        <p className="text-sm text-white/55">
          <span className="text-white/90">Maya, Daniel</span> and 5 others are editing
        </p>
      </div>
      <AvatarGroup size="sm" max={5}>
        {editors.map((person) => (
          <Avatar key={person.name} src={person.src} alt={person.name} />
        ))}
      </AvatarGroup>
    </div>
  );
}
