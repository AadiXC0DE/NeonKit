"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { INVOICES, USAGE } from "../data";
import type { SettingsErrors, SettingsState } from "./model";
import { Panel, Section } from "./section";

export function BillingTab({
  draft,
  errors,
  seats,
  set,
}: {
  draft: SettingsState;
  errors: SettingsErrors;
  seats: number;
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}) {
  return (
    <>
      <Section id="s-plan" title="Plan" description="Billed monthly on the 1st. Seats are prorated to the day.">
        <Panel className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[rgb(var(--neon)/0.08)] blur-[60px]" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgb(var(--neon))]">Pro</p>
              <p className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.04em] text-white">
                $20<span className="text-sm font-normal tracking-normal text-white/60"> / seat / month</span>
              </p>
              <p className="mt-2 text-[13px] text-white/60">
                {seats} seats · ${seats * 20} a month before usage
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-[13px]">
              <dt className="text-white/60">Next invoice</dt>
              <dd className="text-right font-mono text-white/90">$164.00</dd>
              <dt className="text-white/60">Due</dt>
              <dd className="text-right text-white/90">Nov 1, 2026</dd>
            </dl>
          </div>
        </Panel>
      </Section>

      <Section id="s-usage" title="Usage" description="This cycle, Oct 1 to Oct 31. Overage is billed at the end of the cycle.">
        <Panel className="grid gap-6">
          {USAGE.map((u) => {
            const share = u.used / u.limit;
            return (
              <Progress
                key={u.id}
                value={u.used}
                max={u.limit}
                size="sm"
                showValue
                color={share > 0.85 ? "amber" : undefined}
                label={
                  <>
                    {u.label}
                    <span className="ml-2 font-mono text-xs text-white/55">
                      {u.used.toLocaleString("en-US")} / {u.limit.toLocaleString("en-US")} {u.unit}
                    </span>
                  </>
                }
              />
            );
          })}
          <Input
            id="spend-cap"
            label="Monthly spend cap"
            inputMode="numeric"
            leading={<span className="font-mono text-xs text-white/55">$</span>}
            trailing={<span className="text-xs text-white/55">USD</span>}
            value={draft.spendCap}
            error={errors.spendCap}
            description="Past the cap, previews pause and production keeps serving."
            onChange={(e) => set("spendCap", e.target.value.replace(/[^\d]/g, ""))}
            containerClassName="max-w-xs border-t border-white/[0.06] pt-6"
          />
        </Panel>
      </Section>

      <Section id="s-invoices" title="Invoices" description="Paid by card ending 4417. Copies go to billing@marlow.dev.">
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {INVOICES.map((inv) => (
            <li key={inv.id} className="flex items-center gap-4 px-4 py-3 text-[13px] sm:px-5">
              <span className="w-28 shrink-0 text-white/85">{inv.date}</span>
              <span className="hidden flex-1 font-mono text-xs text-white/55 sm:block">{inv.id}</span>
              <span className="ml-auto font-mono text-white/85 sm:ml-0">${inv.amount.toFixed(2)}</span>
              <Badge />
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Download invoice ${inv.id}`}
                className="size-8 px-0"
                onClick={() => toast(`Downloading ${inv.id}.pdf`, { description: "Invoices are stubbed in this preview." })}
              >
                <Download aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function Badge() {
  return <span className="hidden rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/65 sm:inline">Paid</span>;
}
