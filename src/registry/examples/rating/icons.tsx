import { Rating } from "@/components/ui/rating";

export default function RatingIcons() {
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-white/70">Class intensity</span>
        <Rating icon="bolt" color="amber" defaultValue={4} aria-label="Class intensity" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-white/70">Would rewatch</span>
        <Rating icon="heart" color="pink" defaultValue={3} max={3} aria-label="Would rewatch" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-white/70">Overall</span>
        <Rating defaultValue={5} aria-label="Overall" />
      </div>
    </div>
  );
}
