import { Minus, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";

const sizes = [
  { size: "sm", icon: "icon-sm" },
  { size: "md", icon: "icon" },
  { size: "lg", icon: "icon-lg" },
] as const;

export default function ButtonGroupSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      {sizes.map(({ size, icon }) => (
        <ButtonGroup key={size} aria-label={`Quantity, ${size}`}>
          <Button variant="outline" size={icon} aria-label="Fewer">
            <Minus />
          </Button>
          <ButtonGroupText size={size} className="w-14 justify-center tabular-nums text-white/85">
            2
          </ButtonGroupText>
          <Button variant="outline" size={icon} aria-label="More">
            <Plus />
          </Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
