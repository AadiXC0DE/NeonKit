"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LedMatrix } from "@/components/ui/led-matrix";

export default function LedMatrixMessage() {
  const [text, setText] = React.useState("Kitchen closes at 23:00. Last orders please!");
  const [direction, setDirection] = React.useState<"left" | "right">("left");

  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      <LedMatrix text={text} direction={direction} speed={56} />
      <div className="flex items-end gap-2">
        <Input
          label="Message"
          value={text}
          maxLength={80}
          onChange={(event) => setText(event.target.value)}
          containerClassName="min-w-0 flex-1"
        />
        <Button
          size="icon"
          aria-label={direction === "left" ? "Scroll right instead" : "Scroll left instead"}
          onClick={() => setDirection((value) => (value === "left" ? "right" : "left"))}
        >
          {direction === "left" ? <ArrowLeft /> : <ArrowRight />}
        </Button>
      </div>
    </div>
  );
}
