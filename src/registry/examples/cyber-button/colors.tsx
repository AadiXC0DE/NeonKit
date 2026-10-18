import { CyberButton } from "@/components/ui/cyber-button";

export default function CyberButtonColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <CyberButton variant="solid" color="amber" colorAlt="red">
        Override
      </CyberButton>
      <CyberButton color="lime" colorAlt="violet">
        Decrypt
      </CyberButton>
      <CyberButton color="magenta" colorAlt="cyan">
        Jack out
      </CyberButton>
    </div>
  );
}
