import { Radar } from "@/components/ui/radar";

const contacts = [
  { angle: 38, distance: 0.62, label: "BAW 117" },
  { angle: 112, distance: 0.34, label: "KLM 642" },
  { angle: 205, distance: 0.78, label: "EZY 48K" },
  { angle: 291, distance: 0.52, label: "DLH 4AX" },
  { angle: 331, distance: 0.86 },
];

export default function RadarDemo() {
  return <Radar size="lg" blips={contacts} label="Approach radar" />;
}
