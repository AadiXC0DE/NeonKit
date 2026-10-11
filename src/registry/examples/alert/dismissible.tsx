"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AlertDismissible() {
  const [open, setOpen] = React.useState(true);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Show the alert again
      </Button>
    );
  }

  return (
    <Alert
      status="error"
      className="max-w-lg"
      onDismiss={() => setOpen(false)}
      action={
        <Button size="sm" variant="soft">
          Update card
        </Button>
      }
    >
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>The Visa ending in 4242 was declined.</AlertDescription>
    </Alert>
  );
}
