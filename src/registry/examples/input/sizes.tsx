import { Search } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

export default function InputSizes() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input size="sm" aria-label="Small" placeholder="Small" leading={<Search />} />
      <Input size="md" aria-label="Medium" placeholder="Medium" leading={<Search />} />
      <Input size="lg" aria-label="Large" placeholder="Large" leading={<Search />} />
    </div>
  );
}
