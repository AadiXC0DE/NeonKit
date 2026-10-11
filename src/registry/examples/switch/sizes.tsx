import { Switch } from "@/components/ui/switch";

export default function SwitchSizes() {
  return (
    <div className="flex flex-col gap-4">
      <Switch size="sm" defaultChecked label="Small" />
      <Switch size="md" defaultChecked label="Medium" />
      <Switch size="lg" defaultChecked label="Large" />
    </div>
  );
}
