import { Rating } from "@/components/ui/rating";

export default function RatingSizes() {
  return (
    <div className="grid justify-items-center gap-4">
      <Rating size="sm" defaultValue={3} aria-label="Small rating" />
      <Rating size="md" defaultValue={3} aria-label="Medium rating" />
      <Rating size="lg" defaultValue={3} aria-label="Large rating" />
    </div>
  );
}
