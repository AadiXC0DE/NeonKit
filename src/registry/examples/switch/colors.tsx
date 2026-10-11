import { Switch } from "@/components/ui/switch";

const colors = ["cyan", "blue", "violet", "magenta", "pink", "red", "orange", "amber", "lime", "green"] as const;

export default function SwitchColors() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
        {colors.map((color) => (
          <Switch key={color} color={color} defaultChecked label={color} className="capitalize" />
        ))}
      </div>
      <div className="flex justify-center">
        <Switch color="#ff6a00" defaultChecked label="Any hex works · #ff6a00" />
      </div>
    </div>
  );
}
