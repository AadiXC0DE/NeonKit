import { Select } from "@/components/ui/select";

const sorts = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest first" },
  { value: "stars", label: "Most stars" },
  { value: "name", label: "Name" },
];

export default function SelectSizes() {
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Select size="sm" aria-label="Sort repositories" options={sorts} defaultValue="updated" />
      <Select size="md" aria-label="Sort repositories" options={sorts} defaultValue="created" />
      <Select size="lg" aria-label="Sort repositories" options={sorts} defaultValue="stars" />
    </div>
  );
}
