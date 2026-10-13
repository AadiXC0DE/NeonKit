import { Kbd, KbdCombo } from "@/components/ui/kbd";

export default function KbdSizes() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-6">
        <KbdCombo keys={["⌘", "K"]} size="sm" />
        <KbdCombo keys={["⌘", "K"]} size="md" />
        <KbdCombo keys={["⌘", "K"]} size="lg" />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Kbd size="lg" pressed className="col-start-2">
          W
        </Kbd>
        <Kbd size="lg" className="col-start-1">
          A
        </Kbd>
        <Kbd size="lg">S</Kbd>
        <Kbd size="lg" pressed>
          D
        </Kbd>
      </div>
    </div>
  );
}
