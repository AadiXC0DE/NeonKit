"use client";

import * as React from "react";
import { ArrowUp, AtSign, Paperclip } from "@/components/ui/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export default function InputGroupMessage() {
  const [text, setText] = React.useState("");
  const [sent, setSent] = React.useState<string[]>([]);
  const ready = text.trim().length > 0;

  function send() {
    if (!ready) return;
    setSent((list) => [...list, text.trim()]);
    setText("");
  }

  return (
    <div className="min-w-0 w-full max-w-lg">
      {sent.length > 0 && (
        <ul className="mb-3 grid gap-1.5 text-sm text-white/80">
          {sent.map((message, index) => (
            <li key={index} className="ml-auto w-fit max-w-[80%] rounded-xl rounded-br-md bg-white/[0.06] px-3 py-2">
              {message}
            </li>
          ))}
        </ul>
      )}
      <InputGroup>
        <InputGroupTextarea
          aria-label="Reply in #design-crit"
          placeholder="Reply in #design-crit"
          value={text}
          maxRows={6}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              send();
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon" aria-label="Attach a file">
            <Paperclip />
          </InputGroupButton>
          <InputGroupButton size="icon" aria-label="Mention someone">
            <AtSign />
          </InputGroupButton>
          <InputGroupText className="ml-auto hidden text-xs sm:flex">⌘↵ to send</InputGroupText>
          <InputGroupButton
            size="icon"
            variant={ready ? "solid" : "ghost"}
            aria-label="Send"
            disabled={!ready}
            onClick={send}
            className={
              ready
                ? "ml-auto rounded-full sm:ml-0"
                : "ml-auto rounded-full border border-white/10 text-white/35 disabled:opacity-100 sm:ml-0"
            }
          >
            <ArrowUp />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
