import { StatusLight, type StatusLightProps } from "@/components/ui/status-light";

type Lamp = { print: string; name: string; state: NonNullable<StatusLightProps["state"]>; color?: string };

const system: Lamp[] = [
  { print: "PWR", name: "Power", state: "on", color: "green" },
  { print: "SYS", name: "System, booting", state: "standby", color: "green" },
];
const links: Lamp[] = [
  { print: "1", name: "Port 1, link up", state: "on", color: "amber" },
  { print: "2", name: "Port 2, traffic", state: "alert", color: "amber" },
  { print: "3", name: "Port 3, no link", state: "off", color: "amber" },
  { print: "4", name: "Port 4, link up", state: "on", color: "amber" },
];
const fault: Lamp = { print: "FLT", name: "Fault, clear", state: "off", color: "red" };

function Silkscreened({ lamp }: { lamp: Lamp }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <StatusLight variant="panel" state={lamp.state} color={lamp.color} aria-label={lamp.name} />
      <span aria-hidden className="text-[10px] font-medium leading-none tracking-[0.12em] text-white/55">
        {lamp.print}
      </span>
    </span>
  );
}

/** The front of a 1U switch: power, system, four links and a fault lamp. */
export default function StatusLightPanel() {
  return (
    <div className="w-full max-w-[600px] rounded-[10px] border border-black/80 bg-[linear-gradient(180deg,#1b1e26,#101218_55%,#0c0e13)] px-5 py-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_20px_40px_-24px_rgb(0_0_0/0.9)]">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-white/85">Halcyon S24</span>
          <span className="text-[13px] text-white/50">Rack 3, unit 12</span>
        </div>
        <div className="flex items-start gap-4 sm:gap-5">
          {system.map((lamp) => (
            <Silkscreened key={lamp.print} lamp={lamp} />
          ))}
          <span aria-hidden className="h-8 w-px bg-white/[0.08]" />
          {links.map((lamp) => (
            <Silkscreened key={lamp.print} lamp={lamp} />
          ))}
          <span aria-hidden className="h-8 w-px bg-white/[0.08]" />
          <Silkscreened lamp={fault} />
        </div>
      </div>
    </div>
  );
}
