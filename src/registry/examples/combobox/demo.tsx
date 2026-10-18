import { Avatar } from "@/components/ui/avatar";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

const people = [
  { value: "maya", name: "Maya Chen", role: "Design lead", team: "Design" },
  { value: "theo", name: "Theo Laurent", role: "Product designer", team: "Design" },
  { value: "ines", name: "Inès Moreau", role: "Platform", team: "Engineering" },
  { value: "sam", name: "Sam Okafor", role: "Frontend", team: "Engineering" },
  { value: "priya", name: "Priya Raman", role: "Infrastructure", team: "Engineering" },
  { value: "kai", name: "Kai Nakamura", role: "On leave until March 3", team: "Engineering", away: true },
  { value: "lena", name: "Lena Fischer", role: "Product · Checkout", team: "Product" },
  { value: "ravi", name: "Ravi Patel", role: "Product · Growth", team: "Product" },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

const team: ComboboxOption[] = people.map((person) => ({
  value: person.value,
  label: person.name,
  description: person.role,
  group: person.team,
  disabled: person.away,
  icon: <Avatar alt="" fallback={initials(person.name)} size="sm" className="size-6 text-[10px]" />,
}));

export default function ComboboxDemo() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <Combobox
        label="Assignee"
        placeholder="Assign a teammate"
        options={team}
        defaultValue="maya"
        description="They get a notification and the issue lands in their queue."
      />
      <Combobox multiple label="Reviewers" placeholder="Add reviewers" options={team} defaultValue={["ines", "sam"]} />
    </div>
  );
}
