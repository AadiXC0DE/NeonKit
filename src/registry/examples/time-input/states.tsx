"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TimeInput } from "@/components/ui/time-input";

export default function TimeInputStates() {
  const [pickup, setPickup] = React.useState("07:30");
  const [status, setStatus] = React.useState("");
  const tooEarly = pickup !== "" && pickup < "08:00";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const time = new FormData(event.currentTarget).get("pickup");
    setStatus(time ? `Pickup booked for ${time}.` : "Add a pickup time first.");
  }

  return (
    <form onSubmit={submit} className="grid w-full max-w-xs gap-5">
      <TimeInput
        name="pickup"
        label="Pickup"
        value={pickup}
        onValueChange={(value) => {
          setPickup(value);
          setStatus("");
        }}
        error={tooEarly ? "The shop opens at 8:00 AM." : undefined}
        description="Any time from 8:00 AM."
      />
      <TimeInput label="Return" defaultValue="18:00" disabled description="Set by the shop." />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="solid" size="sm">
          Book pickup
        </Button>
        <p aria-live="polite" className="text-xs text-white/55">
          {status}
        </p>
      </div>
    </form>
  );
}
