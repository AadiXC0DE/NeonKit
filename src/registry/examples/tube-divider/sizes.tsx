import { TubeDivider } from "@/components/ui/tube-divider";

export default function TubeDividerSizes() {
  return (
    <div className="grid w-full max-w-lg gap-9">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="grid gap-3">
          <span className="font-mono text-xs text-white/55">
            size=&quot;{size}&quot;{size === "lg" && " · flow"}
          </span>
          <TubeDivider shape="zigzag" size={size} flow={size === "lg"} />
        </div>
      ))}
    </div>
  );
}
