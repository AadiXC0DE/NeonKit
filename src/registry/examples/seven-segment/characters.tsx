import { SevenSegment } from "@/components/ui/seven-segment";

export default function SevenSegmentCharacters() {
  return (
    <div className="flex flex-col items-center gap-5">
      <SevenSegment value="0123456789" size={40} />
      <SevenSegment value="AbCdEF -" size={40} color="lime" />
      <div className="flex flex-wrap items-center justify-center gap-6">
        <SevenSegment value="-12.5" digits={4} size={40} color="orange" aria-label="minus 12.5 degrees" />
        <SevenSegment value="HELP" size={40} color="red" skew={0} />
        <SevenSegment value="88:88" size={40} color="violet" unlit={0.18} />
      </div>
    </div>
  );
}
