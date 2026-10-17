import { Button } from "@/components/ui/button";

const colors = ["cyan", "blue", "violet", "magenta", "pink", "red", "orange", "amber", "lime", "green"] as const;

export default function ButtonColors() {
  return (
    <div className="grid w-full max-w-lg gap-2">
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <Button key={color} color={color} size="sm" className="w-full px-1 capitalize">
            {color}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <Button key={color} color={color} variant="solid" size="sm" className="w-full px-1 capitalize">
            {color}
          </Button>
        ))}
      </div>
      <div className="mt-2 flex justify-center">
        <Button color="#ff6a00" variant="solid" size="sm">
          Any hex works · #ff6a00
        </Button>
      </div>
    </div>
  );
}
