"use client";

import * as React from "react";
import { Banner, BannerAction } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

const KEY = "halcyon:banner:cli-3";

export default function BannerRemembered() {
  // Remounting re-reads storage, the way a page load would.
  const [visit, setVisit] = React.useState(0);

  const forget = () => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // Storage blocked: nothing to forget.
    }
    setVisit((v) => v + 1);
  };

  return (
    <div className="flex w-full max-w-[880px] flex-col items-center gap-5">
      <Banner
        key={visit}
        storageKey={KEY}
        dismissible
        className="w-full"
        action={<BannerAction>Upgrade guide</BannerAction>}
      >
        CLI 3.0 drops Node 18. Run <code className="font-mono text-[13px] text-white/90">halcyon doctor</code> to check your projects.
      </Banner>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setVisit((v) => v + 1)}>
          Reload
        </Button>
        <Button size="sm" variant="ghost" onClick={forget}>
          Forget dismissal
        </Button>
      </div>
    </div>
  );
}
