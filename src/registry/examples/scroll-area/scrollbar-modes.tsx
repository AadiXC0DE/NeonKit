import { ScrollArea } from "@/components/ui/scroll-area";

const regions = [
  "Frankfurt · fra1",
  "London · lhr1",
  "Paris · cdg1",
  "Stockholm · arn1",
  "Washington, D.C. · iad1",
  "Cleveland · cle1",
  "San Francisco · sfo1",
  "Portland · pdx1",
  "São Paulo · gru1",
  "Tokyo · hnd1",
  "Seoul · icn1",
  "Mumbai · bom1",
  "Singapore · sin1",
  "Sydney · syd1",
];

const modes = [
  { mode: "hover", note: "While hovered or scrolling" },
  { mode: "auto", note: "Whenever it overflows" },
  { mode: "always", note: "Track always shown" },
] as const;

export default function ScrollAreaScrollbarModes() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
      {modes.map(({ mode, note }) => (
        <div key={mode} className="grid gap-2">
          <div className="grid">
            <span className="font-mono text-xs text-white/75">scrollbar=&quot;{mode}&quot;</span>
            <span className="text-xs text-white/40">{note}</span>
          </div>
          <ScrollArea
            scrollbar={mode}
            aria-label={`Regions, scrollbar ${mode}`}
            className="h-48 rounded-xl border border-white/10 bg-white/[0.02]"
          >
            <ul className="grid py-2 pr-3">
              {regions.map((region) => (
                <li key={region} className="px-3 py-1.5 text-sm text-white/65">
                  {region}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
