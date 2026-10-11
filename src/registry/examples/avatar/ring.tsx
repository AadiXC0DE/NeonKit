import { Avatar } from "@/components/ui/avatar";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80`;

const participants = [
  { name: "Lena Fischer", src: photo("1438761681033-6461ffad8d80"), speaking: true },
  { name: "Tom Becker", src: photo("1472099645785-5658abf4ff4e"), speaking: false },
  { name: "Sofia Marin", src: photo("1517841905240-472988babdf9"), speaking: false },
  { name: "Noah Kim", src: photo("1519244703995-f4e0f30006d5"), speaking: false },
];

const guests = [
  { name: "Ines Duarte", color: "violet" },
  { name: "Kai Nakamura", color: "magenta" },
  { name: "Ruth Adeyemi", color: "amber" },
  { name: "Elias Berg", color: "lime" },
] as const;

export default function AvatarRing() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-start gap-6">
        {participants.map((person) => (
          <div key={person.name} className="flex w-16 flex-col items-center gap-2.5">
            <Avatar size="lg" src={person.src} alt={person.name} ring={person.speaking} />
            <span className={person.speaking ? "text-xs text-white/90" : "text-xs text-white/45"}>
              {person.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {guests.map((guest) => (
          <Avatar key={guest.name} alt={guest.name} color={guest.color} />
        ))}
        <span className="ml-1 text-xs text-white/40">Guests get their own color</span>
      </div>
    </div>
  );
}
