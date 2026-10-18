import { CyberButton } from "@/components/ui/cyber-button";

export default function CyberButtonVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <CyberButton variant="solid">Accept contract</CyberButton>
      <CyberButton>View briefing</CyberButton>
    </div>
  );
}
