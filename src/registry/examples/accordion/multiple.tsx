import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const groups = [
  {
    value: "type",
    title: "Job type",
    options: [
      { label: "Full-time", count: 42, checked: true },
      { label: "Contract", count: 18, checked: true },
      { label: "Part-time", count: 7, checked: false },
    ],
  },
  {
    value: "location",
    title: "Location",
    options: [
      { label: "Remote", count: 51, checked: true },
      { label: "Lisbon", count: 9, checked: false },
      { label: "Tokyo", count: 6, checked: false },
      { label: "Berlin", count: 4, checked: false },
    ],
  },
  {
    value: "level",
    title: "Level",
    options: [
      { label: "Mid", count: 21, checked: false },
      { label: "Senior", count: 33, checked: false },
      { label: "Staff", count: 8, checked: false },
    ],
  },
];

export default function AccordionMultiple() {
  return (
    <Accordion type="multiple" defaultValue={["type", "location"]} className="max-w-xs">
      {groups.map((group) => (
        <AccordionItem key={group.value} value={group.value}>
          <AccordionTrigger>{group.title}</AccordionTrigger>
          <AccordionContent className="grid gap-2.5 pr-0">
            {group.options.map((option) => (
              <label key={option.label} className="flex cursor-pointer items-center gap-2.5 text-white/70">
                <input
                  type="checkbox"
                  defaultChecked={option.checked}
                  className="size-3.5 shrink-0 cursor-pointer accent-[rgb(var(--neon))]"
                />
                <span className="flex-1">{option.label}</span>
                <span className="tabular-nums text-xs text-white/35">{option.count}</span>
              </label>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
