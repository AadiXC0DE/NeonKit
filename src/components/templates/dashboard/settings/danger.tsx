"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldButton } from "@/components/ui/hold-button";
import { Input } from "@/components/ui/input";
import { Section } from "./section";

export function DangerTab({ slug, name }: { slug: string; name: string }) {
  const [confirm, setConfirm] = React.useState("");
  const [deleted, setDeleted] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Section
      id="s-danger"
      title="Delete team"
      description="Removes every project, deployment, domain and env var. Billing stops at the end of the day."
    >
      <div className="overflow-hidden rounded-2xl border border-[rgb(255_77_94/0.28)] bg-[rgb(255_77_94/0.03)]">
        {deleted ? (
          <div role="status" className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="text-sm font-medium text-white/90">{name} is scheduled for deletion.</p>
              <p className="mt-1 text-[13px] text-white/60">It goes for good on Oct 27, 2026. Until then you can bring it back.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/10"
              onClick={() => {
                setDeleted(false);
                setConfirm("");
              }}
            >
              <RotateCcw aria-hidden />
              Restore team
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-5 sm:p-6">
              <ul className="grid gap-1.5 text-[13px] text-white/65">
                <li>16 projects and 2,418 deployments</li>
                <li>11 custom domains and their certificates</li>
                <li>6 members lose access straight away</li>
              </ul>
              <Input
                id="delete-confirm"
                color="red"
                label={
                  <>
                    Type <span className="font-mono text-white">{slug}</span> to confirm
                  </>
                }
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                containerClassName="max-w-xs"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(255_77_94/0.18)] bg-[rgb(255_77_94/0.03)] px-5 py-3.5 sm:px-6">
              <p className="text-xs text-white/60">Exports stay downloadable for 14 days.</p>
              <HoldButton
                type="button"
                color="red"
                size="sm"
                duration={1800}
                disabled={confirm !== slug}
                completeLabel="Deleting…"
                resetDelay={Infinity}
                hint="Press and hold for two seconds to delete the team."
                onComplete={() => {
                  timer.current = window.setTimeout(() => setDeleted(true), 700);
                }}
              >
                Hold to delete team
              </HoldButton>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
