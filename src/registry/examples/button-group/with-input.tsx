"use client";

import * as React from "react";
import { Search } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export default function ButtonGroupWithInput() {
  const [saved, setSaved] = React.useState(false);

  return (
    <div className="flex min-w-0 w-full max-w-md flex-col gap-4">
      <ButtonGroup className="w-full">
        <Input aria-label="Search logs" placeholder="status:500 /checkout" leading={<Search />} />
        <Button variant="outline">Search</Button>
      </ButtonGroup>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <ButtonGroup className="w-full">
          <ButtonGroupText>https://</ButtonGroupText>
          <Input
            aria-label="Webhook URL"
            defaultValue="hooks.acme.dev/ci"
            onChange={() => setSaved(false)}
            spellCheck={false}
          />
          <Button type="submit" variant={saved ? "soft" : "outline"}>
            {saved ? "Saved" : "Save"}
          </Button>
        </ButtonGroup>
      </form>
    </div>
  );
}
