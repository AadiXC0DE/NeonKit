"use client";

import * as React from "react";
import { Search } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

export default function InputSearch() {
  const ref = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.key !== "/") return;
      const target = event.target as HTMLElement;
      // Let people type a slash into other fields.
      if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      event.preventDefault();
      ref.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Input
      ref={ref}
      type="search"
      aria-label="Search documentation"
      placeholder="Search components and props"
      leading={<Search />}
      trailing={
        <kbd className="pointer-events-none rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-sans text-[11px] font-medium leading-4 text-white/50">
          {focused ? "Esc" : "/"}
        </kbd>
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.currentTarget.blur();
      }}
      containerClassName="max-w-sm"
    />
  );
}
