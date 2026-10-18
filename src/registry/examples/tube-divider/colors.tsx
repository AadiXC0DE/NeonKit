import { TubeDivider } from "@/components/ui/tube-divider";

export default function TubeDividerColors() {
  return (
    <div className="grid w-full max-w-lg gap-8">
      <TubeDivider shape="loop" color="pink" />
      <TubeDivider shape="wave" color="amber" size="sm" />
      <TubeDivider color="#7cff6b" clips={false} />
    </div>
  );
}
