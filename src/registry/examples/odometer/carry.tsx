"use client";

import * as React from "react";
import { Odometer } from "@/components/ui/odometer";
import { Button } from "@/components/ui/button";

const steps = [1, 9, 99, 1000];

export default function OdometerCarry() {
  const [value, setValue] = React.useState(999);

  return (
    <div className="flex flex-col items-center gap-6">
      <Odometer value={value} minDigits={5} grouping={false} size="lg" className="max-sm:[--odo-h:48px]" />
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => setValue((v) => Math.max(0, v - 1))} aria-label="Subtract 1">
          −1
        </Button>
        {steps.map((step) => (
          <Button key={step} size="sm" variant="outline" onClick={() => setValue((v) => Math.min(99999, v + step))} aria-label={`Add ${step.toLocaleString("en-US")}`}>
            +{step.toLocaleString("en-US")}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setValue(999)}>
          Reset
        </Button>
      </div>
    </div>
  );
}
