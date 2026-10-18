import { Gauge } from "@/components/ui/gauge";

export default function GaugeSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Gauge size="sm" label="Boost" unit="bar" value={1.2} min={0} max={2} ticks={4} color="orange" />
      <Gauge size="md" label="Signal" unit="dBm" value={-62} min={-100} max={-30} ticks={7} color="violet" />
      <Gauge size="lg" label="Battery" unit="%" value={84} color="green" />
    </div>
  );
}
