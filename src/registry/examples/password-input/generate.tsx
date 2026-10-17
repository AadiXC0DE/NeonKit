"use client";

import * as React from "react";
import { RefreshCw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

// No 0/O or 1/l/I, so it can be read aloud or typed from a phone.
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_.!#%+";

function generate(length = 20) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

export default function PasswordInputGenerate() {
  const [value, setValue] = React.useState("");
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="grid w-full max-w-sm gap-2">
      <PasswordInput
        label="Database password"
        value={value}
        onValueChange={setValue}
        visible={visible}
        onVisibleChange={setVisible}
        strength
        minLength={16}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-white/50">
          Role <span className="font-mono text-white/70">analytics_ro</span> on db-eu-1
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setValue(generate());
            setVisible(true);
          }}
        >
          <RefreshCw aria-hidden />
          Generate
        </Button>
      </div>
    </div>
  );
}
