import { Select } from "@/components/ui/select";

const regions = [
  { value: "fra1", label: "Frankfurt", description: "eu-central-1 · 12 ms" },
  { value: "lhr1", label: "London", description: "eu-west-2 · 18 ms" },
  { value: "iad1", label: "Washington, D.C.", description: "us-east-1 · 84 ms" },
  { value: "sfo1", label: "San Francisco", description: "us-west-1 · 142 ms" },
  { value: "gru1", label: "São Paulo", description: "sa-east-1 · 196 ms" },
  { value: "hnd1", label: "Tokyo", description: "ap-northeast-1 · 228 ms" },
  { value: "syd1", label: "Sydney", description: "ap-southeast-2 · At capacity", disabled: true },
];

export default function SelectDemo() {
  return (
    <Select
      label="Region"
      description="Where your functions run. Pick the one closest to your database."
      options={regions}
      defaultValue="fra1"
      containerClassName="max-w-xs"
    />
  );
}
