import { NeonText } from "@/components/ui/neon-text";

export default function NeonTextDemo() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <NeonText as="p" buzz className="text-6xl font-light tracking-tight">
        open late
      </NeonText>
      <NeonText as="p" color="white" flicker={false} className="text-sm uppercase tracking-[0.5em]">
        arcade · noodles · karaoke
      </NeonText>
    </div>
  );
}
