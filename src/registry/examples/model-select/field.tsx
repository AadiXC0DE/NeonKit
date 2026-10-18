"use client";

import * as React from "react";
import { ModelSelect, type ModelOption } from "@/components/ui/model-select";

const MODELS: ModelOption[] = [
  { value: "argon-2-mini", name: "Argon 2 Mini", context: 200_000, price: { input: 0.25, output: 1.25 } },
  { value: "argon-2", name: "Argon 2", context: 200_000, price: { input: 3, output: 15 } },
  { value: "argon-2-long", name: "Argon 2 Long", context: 1_000_000, price: { input: 6, output: 22.5 } },
];

export default function ModelSelectField() {
  const [model, setModel] = React.useState("argon-2-mini");
  return (
    <div className="grid w-full max-w-sm gap-2">
      <p className="text-[13.5px] font-medium text-white/85">Model for pull request summaries</p>
      <ModelSelect
        label="Model for pull request summaries"
        variant="outline"
        readouts={["context", "price"]}
        models={MODELS}
        value={model}
        onValueChange={setModel}
        className="w-full justify-between"
      />
      <p className="text-[13px] leading-relaxed text-white/50">
        About 1,900 summaries a month at 3k tokens in and 400 out: $2.38 on Mini, $28.50 on Argon 2.
      </p>
    </div>
  );
}
