import { CyberButton } from "@/components/ui/cyber-button";

export default function CyberButtonDemo() {
  return (
    <div className="w-full max-w-sm border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
        <span>Uplink · Node 07</span>
        <span className="text-[rgb(var(--neon-accent,34_211_238))]">Stable</span>
      </div>
      <p className="mt-4 text-[15px] font-medium text-white/90">Relay found in sector 4</p>
      <p className="mt-1 text-[13px] leading-5 text-white/55">Signal at 82%. Handshake takes about four seconds.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <CyberButton variant="solid">Connect</CyberButton>
        <CyberButton>Scan again</CyberButton>
      </div>
    </div>
  );
}
