import { Circuit } from "@/components/ui/circuit";

const boards = [
  { seed: 3, density: 0.25 },
  { seed: 21, density: 0.6 },
  { seed: 48, density: 1 },
];

export default function CircuitSeeds() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {boards.map((board) => (
        <div key={board.seed} className="flex flex-col gap-2">
          <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
            <Circuit seed={board.seed} density={board.density} />
          </div>
          <p className="text-sm text-white/60">
            seed <span className="font-mono tabular-nums text-white/80">{board.seed}</span>, density{" "}
            <span className="font-mono tabular-nums text-white/80">{board.density}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
