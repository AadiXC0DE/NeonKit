import { Avatar } from "@/components/ui/avatar";

const src =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80";

const sizes = ["sm", "md", "lg", "xl"] as const;
const workspaces = ["Lumen Labs", "Northwind", "Ownpath Studio", "Halcyon"];

export default function AvatarSizes() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-end gap-5">
        {sizes.map((size) => (
          <Avatar key={size} size={size} src={src} alt="Priya Shah" status="online" />
        ))}
      </div>
      <div className="flex items-end gap-5">
        {sizes.map((size, index) => (
          <Avatar key={size} size={size} shape="square" alt={workspaces[index]} />
        ))}
      </div>
    </div>
  );
}
