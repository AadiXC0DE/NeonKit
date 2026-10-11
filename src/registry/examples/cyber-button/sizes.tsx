import { CyberButton } from "@/components/ui/cyber-button";

export default function CyberButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <CyberButton size="sm">Inventory</CyberButton>
      <CyberButton size="md">Inventory</CyberButton>
      <CyberButton size="lg">Inventory</CyberButton>
    </div>
  );
}
