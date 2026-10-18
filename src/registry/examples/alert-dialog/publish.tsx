"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AlertDialogPublish() {
  const [live, setLive] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-white/55">
        Spring catalogue · <span className="text-white/85">{live ? "Live" : "Draft"}</span>
      </span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={live}>
            Publish
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish to 12,480 subscribers?</AlertDialogTitle>
            <AlertDialogDescription>
              The catalogue goes live on the store and the email goes out at once. You can unpublish the page
              later, but not the email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction onClick={() => setLive(true)}>Publish and send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
