"use client";

import * as React from "react";
import { NeonSign } from "@/components/ui/neon-sign";

const profiles = [
  { flicker: "clean", text: "clean", note: "Strikes at once" },
  { flicker: "stutter", text: "stutter", note: "Letters catch one by one" },
  { flicker: "dying", text: "dying", note: "One letter never settles" },
] as const;

export default function NeonSignProfiles() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
        {profiles.map((profile) => (
          <figure key={profile.flicker} className="flex flex-col items-center gap-5">
            <NeonSign
              on={on}
              size="sm"
              flicker={profile.flicker}
              dyingLetter={2}
              lines={[profile.text]}
              style={{ fontFamily: "var(--font-tilt-neon)" }}
            />
            <figcaption className="text-[13px] text-white/55">
              {profile.note}
            </figcaption>
          </figure>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setOn(false);
          setTimeout(() => setOn(true), 450);
        }}
        className="inline-flex h-9 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13px] font-medium text-white/70 outline-none transition-[color,border-color,transform] duration-150 hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] active:scale-[0.97]"
      >
        Strike again
      </button>
    </div>
  );
}
