"use client";

import { Alert } from "@/components/alert";
import { useState } from "react";

export function NeonAlertsPreview() {
  return (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="neon-cyan"
        title="Information"
        description="This is a cyan neon alert with important information for the user."
        closable
      />
      <Alert
        variant="neon-purple"
        title="Announcement"
        description="This is a purple neon alert highlighting a special announcement."
        closable
      />
      <Alert
        variant="neon-chartreuse"
        title="Success!"
        description="Your action was completed successfully with chartreuse styling."
        closable
      />
      <Alert
        variant="neon-pink"
        title="Warning"
        description="This is a pink neon alert indicating a potential issue."
        closable
      />
    </div>
  );
}

export function BasicAlertsPreview() {
  return (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        title="Default Alert"
        description="This is a standard alert with default styling for general notifications."
        closable
      />
      <Alert
        title="Simple Message"
        description="A basic alert without a close button."
      />
      <Alert
        description="An alert with just a description and no title."
        closable
      />
    </div>
  );
}

export function StatusAlertsPreview() {
  return (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="neon-success"
        title="Success"
        description="Your changes have been saved successfully!"
        closable
      />
      <Alert
        variant="neon-destructive"
        title="Error"
        description="There was an error processing your request. Please try again."
        closable
      />
      <Alert
        variant="neon-warning"
        title="Warning"
        description="This action cannot be undone. Please proceed with caution."
        closable
      />
      <Alert
        variant="neon-cyan"
        title="Information"
        description="Here's some important information you should know."
        closable
      />
    </div>
  );
}

export function SizeAlertsPreview() {
  return (
    <div className="space-y-4 w-full max-w-2xl">
      <Alert
        variant="neon-cyan"
        size="sm"
        title="Small Alert"
        description="This is a small alert with compact spacing."
        closable
      />
      <Alert
        variant="neon-purple"
        size="default"
        title="Default Alert"
        description="This is a default size alert with standard spacing."
        closable
      />
      <Alert
        variant="neon-chartreuse"
        size="lg"
        title="Large Alert"
        description="This is a large alert with generous spacing for better readability."
        closable
      />
    </div>
  );
}
