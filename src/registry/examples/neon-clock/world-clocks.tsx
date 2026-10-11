import { NeonClock } from "@/components/ui/neon-clock";

const cities = [
  { label: "Tokyo", timeZone: "Asia/Tokyo" },
  { label: "London", timeZone: "Europe/London" },
  { label: "New York", timeZone: "America/New_York" },
];

export default function NeonClockWorldClocks() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      {cities.map((city) => (
        <NeonClock key={city.timeZone} size="sm" timeZone={city.timeZone} label={city.label} />
      ))}
    </div>
  );
}
