import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";

export default function ButtonGroupSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ButtonGroup key={size} aria-label={`Quantity, ${size}`}>
          <Button variant="outline" size={size} aria-label="Fewer">
            −
          </Button>
          <ButtonGroupText size={size} className="w-14 justify-center tabular-nums text-white/85">
            2
          </ButtonGroupText>
          <Button variant="outline" size={size} aria-label="More">
            +
          </Button>
        </ButtonGroup>
      ))}
    </div>
  );
}
