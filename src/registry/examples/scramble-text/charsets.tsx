import { ScrambleText } from "@/components/ui/scramble-text";

const rows = [
  { charset: "upper", text: "NEON CITY 2049", note: "upper" },
  { charset: "hex", text: "0x22D3EE", note: "hex" },
  { charset: "binary", text: "10110010", note: "binary" },
  { charset: "symbols", text: "ACCESS GRANTED", note: "symbols" },
  { charset: "アイウエオカキクケコサシスセソ", text: "TOKYO", note: "custom" },
] as const;

export default function ScrambleTextCharsets() {
  return (
    <dl className="grid w-full max-w-md grid-cols-[auto_1fr] items-baseline gap-x-8 gap-y-4">
      {rows.map((row) => (
        <div key={row.note} className="contents">
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">{row.note}</dt>
          <dd className="font-mono text-xl text-white/90">
            <ScrambleText text={row.text} charset={row.charset} duration={1400} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
