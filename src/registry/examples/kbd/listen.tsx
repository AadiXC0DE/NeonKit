import { Kbd } from "@/components/ui/kbd";

const keys = [
  { label: "⇧ shift", listen: "Shift", width: "w-24 justify-start" },
  { label: "⌃", listen: "Control", width: "w-11" },
  { label: "⌥", listen: "Alt", width: "w-11" },
  { label: "⌘", listen: "Meta", width: "w-14" },
  { label: "", listen: " ", width: "w-40" },
];

export default function KbdListen() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-1.5" aria-hidden>
        {keys.map((key) => (
          <Kbd key={key.listen} size="lg" listen={key.listen} className={`h-11 ${key.width}`}>
            {key.label}
          </Kbd>
        ))}
      </div>
      <p className="text-sm text-white/50">
        Press <span className="text-white/80">Shift</span>, any modifier or the space bar.
      </p>
    </div>
  );
}
