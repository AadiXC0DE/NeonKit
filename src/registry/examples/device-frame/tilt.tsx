import { DeviceFrame } from "@/components/ui/device-frame";

const rows = [
  ["evt_8Kq2", "invoice.paid", "200", "84 ms"],
  ["evt_8Kq1", "customer.updated", "200", "61 ms"],
  ["evt_8Kpz", "invoice.paid", "503", "retry 2"],
  ["evt_8Kpy", "charge.refunded", "200", "92 ms"],
  ["evt_8Kpx", "invoice.created", "200", "70 ms"],
];

export default function DeviceFrameTilt() {
  return (
    <div className="relative w-full max-w-2xl pb-[22%]">
      <DeviceFrame url="relay.dev/acme/deliveries" tilt={8} className="w-[86%]">
        <div className="h-full p-[3cqw] text-[1.8cqw]">
          <p className="text-[2.6cqw] font-semibold tracking-tight text-white/90">Deliveries</p>
          <ul className="mt-[2.4cqw] divide-y divide-white/[0.05] font-mono">
            {rows.map(([id, type, code, time]) => (
              <li key={id} className="flex gap-[2cqw] py-[1.3cqw]">
                <span className="w-[13cqw] text-white/45">{id}</span>
                <span className="flex-1 text-white/80">{type}</span>
                <span className={code === "200" ? "text-white/60" : "text-[rgb(var(--neon))]"}>{code}</span>
                <span className="w-[11cqw] text-right text-white/45">{time}</span>
              </li>
            ))}
          </ul>
        </div>
      </DeviceFrame>
      <DeviceFrame variant="phone" time="9:41" tilt={8} className="absolute bottom-0 right-0 w-[27%] min-w-[110px]">
        <div className="flex h-full flex-col px-[7cqw] pb-[12cqw] pt-[17cqw] text-[4.6cqw]">
          <p className="text-white/50">evt_8Kpz · retry 2 of 9</p>
          <p className="mt-[1cqw] text-[7.5cqw] font-semibold leading-tight tracking-tight text-white/90">503 from api.acme.dev</p>
          <ul className="mt-[5cqw] divide-y divide-white/[0.06] border-y border-white/[0.06] font-mono text-[4.2cqw]">
            {[
              ["14:02:13", "503"],
              ["14:02:23", "503"],
              ["14:02:41", "503"],
            ].map(([at, code]) => (
              <li key={at} className="flex justify-between py-[2.4cqw]">
                <span className="text-white/45">{at}</span>
                <span className="text-[rgb(var(--neon))]">{code}</span>
              </li>
            ))}
          </ul>
          <p className="mt-[4cqw] text-white/50">Next attempt in 2 min 30 s</p>
          <p className="mt-auto rounded-[3cqw] bg-[rgb(var(--neon))] py-[3cqw] text-center font-medium text-[#05060a]">Replay now</p>
        </div>
      </DeviceFrame>
    </div>
  );
}
