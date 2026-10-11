import { NeonIcon } from "@/components/ui/neon-icon";
import { Button } from "@/components/ui/button";

export default function NeonIconSizes() {
  return (
    <div className="grid justify-items-center gap-8">
      <div className="flex items-end gap-6">
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <NeonIcon icon="wifi" size={size} value={0.7} />
            <span className="font-mono text-[11px] text-white/45">{size}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <NeonIcon icon="wifi" size={48} value={0.7} />
          <span className="font-mono text-[11px] text-white/45">48</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="sm">
          <NeonIcon icon="power" size="sm" aria-hidden /> Restart
        </Button>
        <Button size="md">
          <NeonIcon icon="signal" size="sm" value={0.5} aria-hidden /> Run speed test
        </Button>
        <Button size="lg">
          <NeonIcon icon="bolt" size="sm" aria-hidden /> Boost
        </Button>
      </div>
    </div>
  );
}
