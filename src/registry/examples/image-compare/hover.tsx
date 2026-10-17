import { ImageCompare } from "@/components/ui/image-compare";
import { NeonSign } from "@/components/ui/neon-sign";

function Sign({ on }: { on: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center bg-[radial-gradient(ellipse_at_50%_40%,#141722,#07080c_70%)]">
      <NeonSign
        on={on}
        color="pink"
        frame="pill"
        size="lg"
        flicker="clean"
        style={{ fontFamily: "var(--font-tilt-neon)" }}
        lines={["Night shift"]}
      />
    </div>
  );
}

export default function ImageCompareHover() {
  return (
    <ImageCompare
      hover
      color="pink"
      className="aspect-[16/9] w-full max-w-[640px]"
      defaultValue={50}
      beforeLabel="Unlit"
      afterLabel="Lit"
      before={<Sign on={false} />}
      after={<Sign on />}
    />
  );
}
