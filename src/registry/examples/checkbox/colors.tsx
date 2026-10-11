import { Checkbox } from "@/components/ui/checkbox";

const colors = ["cyan", "blue", "violet", "magenta", "pink", "red", "orange", "amber", "lime", "green"] as const;

export default function CheckboxColors() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {colors.map((color) => (
          <Checkbox key={color} color={color} defaultChecked label={color} className="capitalize" />
        ))}
      </div>
      <div className="flex justify-center">
        <Checkbox color="#ff6a00" defaultChecked label="Any hex works · #ff6a00" />
      </div>
    </div>
  );
}
