"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { SplitFlap } from "@/components/ui/split-flap";

export default function SplitFlapPlayground() {
  const [text, setText] = React.useState("GATE CHANGE");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <SplitFlap value={text} length={12} className="[--flap-h:28px] lg:[--flap-h:40px]" />
      <Input
        label="Message"
        description="Letters, digits and . , : - / & ' ! ? are on the drum. Anything else drops straight in."
        value={text}
        maxLength={12}
        onChange={(event) => setText(event.target.value)}
        containerClassName="w-full"
      />
    </div>
  );
}
