"use client";

import * as React from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InputDemo() {
  const [visible, setVisible] = React.useState(false);

  return (
    <form className="grid w-full max-w-sm gap-4" onSubmit={(event) => event.preventDefault()}>
      <Input
        type="email"
        label="Email"
        placeholder="you@company.com"
        autoComplete="email"
        leading={<Mail />}
      />
      <Input
        type={visible ? "text" : "password"}
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        leading={<LockKeyhole />}
        trailing={
          <button
            type="button"
            aria-label="Show password"
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            className="-mr-1.5 grid size-7 cursor-pointer place-items-center rounded-md text-white/40 outline-none transition-colors hover:text-white/80 focus-visible:bg-[rgb(var(--neon)/0.12)] focus-visible:text-[rgb(var(--neon))]"
          >
            {visible ? <EyeOff /> : <Eye />}
          </button>
        }
      />
      <Button type="submit" variant="solid" className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
