import { NeonText } from "@/components/ui/neon-text";

const signs = [
  { text: "Bar", color: "pink" },
  { text: "24h", color: "amber" },
  { text: "Taxi", color: "lime" },
  { text: "Hotel", color: "red" },
  { text: "Live", color: "blue" },
] as const;

export default function NeonTextColors() {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-4">
      {signs.map((sign) => (
        <NeonText key={sign.text} color={sign.color} flicker={false} className="text-4xl font-medium">
          {sign.text}
        </NeonText>
      ))}
    </div>
  );
}
