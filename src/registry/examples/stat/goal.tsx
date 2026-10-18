"use client";

import { Target, UsersRound } from "@/components/ui/icons";
import { Stat } from "@/components/ui/stat";

export default function StatGoal() {
  return (
    <div className="grid w-full max-w-2xl gap-x-12 gap-y-10 sm:grid-cols-[1.4fr_1fr]">
      <Stat
        size="lg"
        icon={Target}
        color="lime"
        label="Q4 new ARR"
        value={412800}
        formatOptions={{ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }}
        goal={600000}
        delta={14.6}
        helper="38 days left in the quarter"
      />
      <Stat
        icon={UsersRound}
        label="Seats filled"
        value={86}
        goal={100}
        formatGoal={(share) => `${100 - Math.round(share * 100)} seats open`}
        helper="Team plan, renews 1 Feb"
      />
    </div>
  );
}
