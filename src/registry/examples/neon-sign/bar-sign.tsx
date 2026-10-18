import { NeonSign } from "@/components/ui/neon-sign";

// Any monoline script works. Neonderthaw was drawn for neon tubes.
const script = "https://fonts.googleapis.com/css2?family=Neonderthaw&display=swap";

export default function NeonSignBarSign() {
  return (
    <>
      <link rel="stylesheet" href={script} precedence="default" />
      <NeonSign
        color="magenta"
        size="xl"
        cable="bottom"
        buzz
        lines={[
          {
            text: "cocktails",
            className: "px-[0.12em] text-[1.35em] leading-[1.05] [font-family:Neonderthaw,sans-serif]",
          },
          {
            text: "UPSTAIRS · TILL 2",
            color: "amber",
            className: "mt-[0.1em] pl-[0.42em] text-[0.24em] tracking-[0.42em]",
          },
        ]}
        style={{ fontFamily: "var(--font-tilt-neon)" }}
      />
    </>
  );
}
