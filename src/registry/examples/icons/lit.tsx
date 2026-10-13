import { Bell, CircleCheck, Plug, TriangleAlert, Wifi } from "@/components/ui/icons";

const rows = [
  { Icon: Wifi, label: "Edge network", state: "Serving", lit: true },
  { Icon: Plug, label: "Webhooks", state: "Connected", lit: true },
  { Icon: TriangleAlert, label: "eu-west-2", state: "Degraded", lit: true, warn: true },
  { Icon: Bell, label: "Paging", state: "Off tonight", lit: false },
  { Icon: CircleCheck, label: "Backups", state: "Done 02:14", lit: false },
];

export default function IconsLit() {
  return (
    <ul className="w-full max-w-sm divide-y divide-white/[0.06]">
      {rows.map(({ Icon, label, state, lit, warn }) => (
        <li key={label} className="flex items-center gap-3.5 py-3">
          <Icon
            aria-hidden
            className={
              lit
                ? warn
                  ? "size-5 text-[rgb(251_191_36)] [filter:drop-shadow(0_0_1px_rgb(255_255_255/0.6))_drop-shadow(0_0_6px_rgb(251_191_36/0.7))]"
                  : "size-5 text-[rgb(var(--neon-accent,34_211_238))] [filter:drop-shadow(0_0_1px_rgb(255_255_255/0.6))_drop-shadow(0_0_6px_rgb(var(--neon-accent,34_211_238)/0.7))]"
                : "size-5 text-white/40"
            }
          />
          <span className="flex-1 text-sm text-white/90">{label}</span>
          <span className="text-xs text-white/55">{state}</span>
        </li>
      ))}
    </ul>
  );
}
