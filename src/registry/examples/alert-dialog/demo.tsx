"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogConfirmInput,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PROJECT = "acme-web";
const DANGER = "red";

export default function AlertDialogDemo() {
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  return (
    <div className="flex min-w-0 w-full max-w-xl items-center justify-between gap-6 border-y border-white/[0.07] py-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">{deleted ? "Project deleted" : "Delete this project"}</p>
        <p className="mt-0.5 text-[13px] leading-5 text-white/55">
          {deleted ? "acme-web is gone. Its domains are free to reuse." : "Removes every deployment, domain and log for good."}
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)} confirmText={PROJECT}>
        <AlertDialogTrigger asChild>
          <Button color={DANGER} variant="soft" disabled={deleted}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {PROJECT}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>214 deployments</strong>, <strong>3 domains</strong> and every environment
              variable. Nothing can be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogConfirmInput />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep project</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              loading={deleting}
              onClick={(event) => {
                event.preventDefault();
                setDeleting(true);
                window.setTimeout(() => {
                  setDeleting(false);
                  setDeleted(true);
                  setOpen(false);
                }, 1100);
              }}
            >
              {deleting ? "Deleting" : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
