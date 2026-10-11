import { Button } from "@/components/ui/button";

const colors = ["cyan", "blue", "violet", "magenta", "pink", "red", "orange", "amber", "lime", "green"] as const;

export default function ButtonColors() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {colors.map((color) => (
          <Button key={color} color={color} size="sm" className="capitalize">
            {color}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {colors.map((color) => (
          <Button key={color} color={color} variant="solid" size="sm" className="capitalize">
            {color}
          </Button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button color="#ff6a00" variant="solid" size="sm">
          Any hex works · #ff6a00
        </Button>
      </div>
    </div>
  );
}
