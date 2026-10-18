import { Bold, Italic, TextAlignCenter, TextAlignEnd, TextAlignStart, Underline } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const quiet = "border border-white/10 text-white/70";

export default function ButtonGroupToolbar() {
  return (
    <ButtonGroup aria-label="Formatting">
      <ButtonGroup aria-label="Text style">
        <Button variant="ghost" size="icon" aria-label="Bold" className={quiet}>
          <Bold />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Italic" className={quiet}>
          <Italic />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Underline" className={quiet}>
          <Underline />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Alignment">
        <Button variant="ghost" size="icon" aria-label="Align left" className={quiet}>
          <TextAlignStart />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Align center" className={quiet}>
          <TextAlignCenter />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Align right" className={quiet}>
          <TextAlignEnd />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
