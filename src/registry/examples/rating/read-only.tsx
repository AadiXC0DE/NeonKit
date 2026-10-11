import { Rating } from "@/components/ui/rating";

const distribution = [
  { stars: 5, share: 71 },
  { stars: 4, share: 19 },
  { stars: 3, share: 6 },
  { stars: 2, share: 2 },
  { stars: 1, share: 2 },
];

export default function RatingReadOnly() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="flex items-center gap-4">
        <span className="text-4xl font-semibold tabular-nums tracking-tight text-white/90">4.6</span>
        <div className="grid gap-1">
          <Rating readOnly value={4.6} size="sm" aria-label="Average rating" />
          <span className="text-xs text-white/55">Based on 2,318 reviews</span>
        </div>
      </div>
      <ul className="grid gap-1.5" aria-label="Rating breakdown">
        {distribution.map((row) => (
          <li key={row.stars} className="flex items-center gap-3 text-xs tabular-nums text-white/55">
            <span className="w-12 shrink-0">{row.stars} {row.stars === 1 ? "star" : "stars"}</span>
            <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-white/40"
                style={{ width: `${row.share}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right">{row.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
