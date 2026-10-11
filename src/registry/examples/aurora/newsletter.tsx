"use client";

import * as React from "react";
import { Aurora } from "@/components/ui/aurora";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuroraNewsletter() {
  const [joined, setJoined] = React.useState(false);

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#07080d] px-6 pb-7 pt-24 sm:px-8">
      <Aurora opacity={0.7} speed={0.7} />
      <div className="relative">
        <h3 className="text-xl font-semibold tracking-tight text-white/90">The Night Shift</h3>
        <p className="mt-1.5 text-sm text-white/55">
          One email a month: what we shipped, what broke, and what we learned at 3am.
        </p>
        {joined ? (
          <p role="status" className="mt-5 h-10 text-sm leading-10 text-[rgb(var(--neon-accent,34_211_238))]">
            You&apos;re on the list. See you after midnight.
          </p>
        ) : (
          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setJoined(true);
            }}
          >
            <Input type="email" required placeholder="you@studio.com" aria-label="Email address" containerClassName="flex-1" />
            <Button type="submit" variant="solid">
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
