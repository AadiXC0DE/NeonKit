import { CyberButton } from "@/components/ui/cyber-button";

export default function CyberButtonDemo() {
  return (
    <div className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] font-medium text-white/90">Relay found in sector 4</p>
        <span className="shrink-0 text-[13px] text-[rgb(var(--neon-accent,34_211_238))]">Node 07 stable</span>
      </div>
      <p className="mt-1 text-[13px] leading-5 text-white/55">Signal at 82%. Handshake takes about four seconds.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <CyberButton variant="solid">Connect</CyberButton>
        <CyberButton>Scan again</CyberButton>
      </div>
    </div>
  );
}
