import { NeonText } from "@/components/ui/neon-text";

export default function NeonTextDemo() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <NeonText as="p" buzz className="text-[clamp(3rem,12vw,4.5rem)] font-light leading-none tracking-tight">
        open late
      </NeonText>
      <NeonText as="p" color="white" flicker={false} className="text-xl font-light tracking-[0.12em]">
        noodles · karaoke
      </NeonText>
    </div>
  );
}
