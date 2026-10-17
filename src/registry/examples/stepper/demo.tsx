"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CircleCheck, CreditCard, RotateCcw, Truck, Zap } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Step, Stepper } from "@/components/ui/stepper";

const steps = [
  { title: "Cart", description: "2 items" },
  { title: "Shipping", description: "Address and speed" },
  { title: "Payment", description: "Card on file" },
  { title: "Review", description: "Confirm and pay" },
];

const row = "flex items-baseline justify-between gap-4 text-sm";

const deliveries = [
  { id: "standard", icon: Truck, title: "Standard delivery", detail: "3–5 business days, by Fri 24", price: "Free" },
  { id: "next-day", icon: Zap, title: "Next day", detail: "Order by 16:00 for Tuesday", price: "$12.00" },
];

function DeliveryOptions() {
  const [speed, setSpeed] = React.useState("standard");
  return (
    <div role="radiogroup" aria-label="Delivery speed" className="grid content-start gap-2">
      {deliveries.map(({ id, icon: Icon, title, detail, price }) => {
        const on = speed === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setSpeed(id)}
            className={
              on
                ? "flex items-start gap-3 rounded-lg border border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--neon)/0.06)] p-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                : "flex items-start gap-3 rounded-lg border border-white/10 p-3 text-left text-sm outline-none transition-colors hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            }
          >
            <Icon aria-hidden className={on ? "mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))]" : "mt-0.5 size-4 shrink-0 text-white/45"} />
            <span className="grid flex-1 gap-0.5">
              <span className={on ? "text-white/90" : "text-white/75"}>{title}</span>
              <span className="text-xs text-white/50">{detail}</span>
            </span>
            <span className="text-xs tabular-nums text-white/60">{price}</span>
          </button>
        );
      })}
    </div>
  );
}

function Panel({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="grid gap-3">
        <div className={row}>
          <span className="grid">
            <span className="text-white/90">Halo desk lamp</span>
            <span className="text-xs text-white/50">Graphite · 2700K</span>
          </span>
          <span className="tabular-nums text-white/80">$129.00</span>
        </div>
        <div className={row}>
          <span className="grid">
            <span className="text-white/90">Spare tube, 40 cm</span>
            <span className="text-xs text-white/50">Qty 2</span>
          </span>
          <span className="tabular-nums text-white/80">$36.00</span>
        </div>
        <div className={`${row} border-t border-white/10 pt-3`}>
          <span className="text-white/55">Subtotal</span>
          <span className="font-medium tabular-nums text-white/90">$165.00</span>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="grid content-start gap-4 sm:grid-cols-2">
        <div className="grid gap-0.5 text-sm">
          <span className="text-xs text-white/50">Ship to</span>
          <span className="text-white/90">Mira Okafor</span>
          <span className="text-white/60">18 Harbour Street, Leith</span>
          <span className="text-white/60">Edinburgh EH6 6PZ</span>
        </div>
        <DeliveryOptions />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="grid gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <CreditCard aria-hidden className="size-4 shrink-0 text-white/60" />
          <span className="grid flex-1 text-sm">
            <span className="text-white/90">Visa ending 4242</span>
            <span className="text-xs text-white/50">Expires 08/28</span>
          </span>
          <span className="text-xs text-white/50">Default</span>
        </div>
        <p className="text-xs text-white/50">Billing address is the same as shipping.</p>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="grid gap-2">
        <div className={row}>
          <span className="text-white/55">Items</span>
          <span className="tabular-nums text-white/80">$165.00</span>
        </div>
        <div className={row}>
          <span className="text-white/55">Shipping</span>
          <span className="text-white/80">Free</span>
        </div>
        <div className={row}>
          <span className="text-white/55">VAT (20%)</span>
          <span className="tabular-nums text-white/80">$33.00</span>
        </div>
        <div className={`${row} border-t border-white/10 pt-3`}>
          <span className="text-white/90">Total</span>
          <span className="text-base font-medium tabular-nums text-white">$198.00</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <CircleCheck
        aria-hidden
        className="size-6 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_8px_rgb(var(--neon)/0.7))]"
      />
      <p className="text-sm font-medium text-white/90">Order NK-20418 placed</p>
      <p className="text-xs text-white/50">A receipt is on its way to mira@lumenlabs.dev.</p>
    </div>
  );
}

export default function StepperDemo() {
  const [step, setStep] = React.useState(1);
  const [reached, setReached] = React.useState(1);
  const placed = step === steps.length;

  function go(next: number) {
    setStep(next);
    setReached((furthest) => Math.max(furthest, next));
  }

  function restart() {
    setStep(0);
    setReached(0);
  }

  return (
    <div className="grid w-full max-w-xl gap-6">
      <Stepper value={step} onValueChange={go} clickable aria-label="Checkout">
        {steps.map((item, index) => (
          <Step
            key={item.title}
            title={item.title}
            description={item.description}
            disabled={placed || index > reached}
          />
        ))}
      </Stepper>

      <div className="grid min-h-[156px] content-start rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <Panel step={step} />
      </div>

      <div className="flex items-center justify-between">
        {placed ? (
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcw /> Start over
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => go(step - 1)} disabled={step === 0}>
            <ArrowLeft /> Back
          </Button>
        )}
        {!placed && (
          <Button variant="solid" size="sm" onClick={() => go(step + 1)}>
            {step === steps.length - 1 ? "Place order" : "Continue"}
            {step < steps.length - 1 && <ArrowRight />}
          </Button>
        )}
      </div>
    </div>
  );
}
