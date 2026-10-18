import { ScrambleText } from "@/components/ui/scramble-text";

const rows = [
  { charset: "upper", text: "NEON CITY 2049", note: "Upper" },
  { charset: "hex", text: "0x22D3EE", note: "Hex" },
  { charset: "binary", text: "10110010", note: "Binary" },
  { charset: "symbols", text: "Access granted", note: "Symbols" },
  { charset: "アイウエオカキクケコサシスセソ", text: "TOKYO", note: "Katakana" },
] as const;

export default function ScrambleTextCharsets() {
  return (
    <dl className="grid w-full max-w-md grid-cols-[auto_1fr] items-baseline gap-x-8 gap-y-4">
      {rows.map((row) => (
        <div key={row.note} className="contents">
          <dt className="text-[13px] text-white/55">{row.note}</dt>
          <dd className="font-mono text-xl text-white/90">
            <ScrambleText text={row.text} charset={row.charset} duration={1400} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
