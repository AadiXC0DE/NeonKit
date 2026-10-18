import { Checkbox } from "@/components/ui/checkbox";

const colors = ["cyan", "blue", "violet", "magenta", "pink", "red", "orange", "amber", "lime", "green"] as const;

export default function CheckboxColors() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <div className="mx-auto grid grid-cols-[repeat(2,auto)] gap-x-8 gap-y-3 sm:grid-cols-[repeat(5,auto)] sm:gap-x-6">
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
