import { ModelSelect, type ModelOption } from "@/components/ui/model-select";

const MODELS: ModelOption[] = [
  { value: "halyard-70b", name: "Halyard 70B", description: "On the rack in Frankfurt, 4 × H100", context: 128_000, speed: 32 },
  { value: "halyard-8b", name: "Halyard 8B", description: "On this laptop, Q4", context: 32_000, speed: 58 },
  { value: "argon-2", name: "Argon 2", description: "Hosted, leaves your network", context: 200_000, speed: 78 },
];

export default function ModelSelectLocal() {
  return <ModelSelect models={MODELS} defaultValue="halyard-70b" readouts={["context", "speed"]} label="Runtime model" variant="outline" />;
}
