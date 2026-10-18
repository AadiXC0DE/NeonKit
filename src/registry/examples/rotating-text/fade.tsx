import { RotatingText } from "@/components/ui/rotating-text";

export default function RotatingTextFade() {
  return (
    <p className="max-w-md text-[17px] leading-relaxed text-white/70">
      Your agent replied to 1,204 tickets this week and escalated 31, mostly about{" "}
      <RotatingText flicker={false} words={["refunds", "SSO setup", "invoice VAT"]} interval={2400} className="font-medium" />.
    </p>
  );
}
