import { CrtOverlay } from "@/components/ui/crt-overlay";

const log = [
  { time: "23:58:02", text: "relay-3   heartbeat ok   12ms" },
  { time: "23:58:32", text: "relay-3   heartbeat ok   11ms" },
  { time: "23:59:02", text: "relay-7   link down, retrying" },
  { time: "23:59:04", text: "relay-7   link up        38ms" },
];

export default function CrtOverlayPhosphor() {
  return (
    <CrtOverlay phosphor color="amber" className="w-full max-w-lg">
      <div className="p-5 font-mono text-[11px] leading-5 text-white sm:p-6 sm:text-[13px] sm:leading-6">
        <p>NK/OS 2.1 (tty1)</p>
        <p className="text-white/60">Last login: Sat Oct 10 23:41 on tty1</p>
        <p className="mt-3">
          <span className="text-white/60">operator@relay $</span> tail -n 4 /var/log/relay
        </p>
        {log.map((line) => (
          <p key={line.time} className="whitespace-pre">
            <span className="text-white/60">{line.time}</span> {line.text}
          </p>
        ))}
        <p className="mt-3">
          <span className="text-white/60">operator@relay $</span>{" "}
          <span aria-hidden className="inline-block h-4 w-2 translate-y-0.5 bg-white motion-safe:animate-pulse" />
        </p>
      </div>
    </CrtOverlay>
  );
}
