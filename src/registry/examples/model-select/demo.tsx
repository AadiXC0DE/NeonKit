"use client";

import * as React from "react";
import { ModelSelect, type ModelOption } from "@/components/ui/model-select";
import { PromptInput } from "@/components/ui/prompt-input";

const MODELS: ModelOption[] = [
  {
    value: "argon-2",
    name: "Argon 2",
    description: "Code review, refactors, long agent runs",
    context: 200_000,
    speed: 78,
    price: { input: 3, output: 15 },
  },
  {
    value: "argon-2-mini",
    name: "Argon 2 Mini",
    description: "Autocomplete, triage, quick questions",
    context: 200_000,
    speed: 190,
    price: { input: 0.25, output: 1.25 },
  },
  {
    value: "argon-2-long",
    name: "Argon 2 Long",
    description: "Whole repositories and multi-hour transcripts",
    context: 1_000_000,
    speed: 41,
    price: { input: 6, output: 22.5 },
  },
  {
    value: "argon-1-5",
    name: "Argon 1.5",
    note: "Retires Jan 31",
    context: 128_000,
    speed: 64,
    price: { input: 2, output: 8 },
  },
  {
    value: "argon-3-preview",
    name: "Argon 3 Preview",
    note: "Team plan",
    context: 400_000,
    speed: 55,
    price: { input: 5, output: 25 },
    disabled: true,
  },
];

export default function ModelSelectDemo() {
  const [model, setModel] = React.useState("argon-2");
  return (
    <div className="w-full max-w-2xl">
      <PromptInput
        placeholder="Ask about the billing service"
        toolbar={<ModelSelect side="top" models={MODELS} value={model} onValueChange={setModel} />}
      />
    </div>
  );
}
