import { NeonFrame } from "@/components/ui/neon-frame";
import { NeonIcon } from "@/components/ui/neon-icon";
import { Sparkline } from "@/components/ui/glow-chart";

// Uplink throughput over the last two minutes, in Mbps, sampled every 10s.
const throughput = [366, 378, 371, 392, 405, 388, 397, 414, 402, 419, 408, 412];

const readings = [
  { label: "Latency", value: "38", unit: "ms" },
  { label: "Packet loss", value: "0.02", unit: "%" },
  { label: "Handshake", value: "4", unit: "s ago" },
];

export default function NeonFrameDemo() {
  return (
    <NeonFrame
      as="section"
      label="Relay KX-7"
      tabs={{ topRight: "Ch 04", bottomLeft: "52.5200 N · 13.4050 E", bottomRight: "Live" }}
      scanline
      className="w-full max-w-lg px-6 pb-8 pt-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Uplink</p>
          <p className="mt-1.5 text-4xl font-semibold tracking-[-0.02em] text-white">
            412 <span className="text-base font-normal text-white/45">Mbps</span>
          </p>
        </div>
        <NeonIcon icon="signal" value={0.75} size={28} label="Signal: 3 of 4 bars, −67 dBm" className="mt-1" />
      </div>

      <Sparkline data={throughput} width="100%" height={44} live className="mt-4" label="Uplink throughput, last 2 minutes" />

      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-5">
        {readings.map((reading) => (
          <div key={reading.label} className="grid gap-1">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{reading.label}</dt>
            <dd className="text-lg font-medium text-white/90">
              {reading.value} <span className="text-xs font-normal text-white/45">{reading.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </NeonFrame>
  );
}
