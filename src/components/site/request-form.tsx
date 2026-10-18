"use client";

import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { shareOnX, siteConfig } from "@/config/site";
import { categories as registryCategories } from "@/registry";

const categories = [...registryCategories, "Not sure"].map((value) => ({
  value,
  label: value,
}));

export function RequestForm() {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Not sure");
  const [details, setDetails] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const missingName = touched && !name.trim();

  const issueUrl = () => {
    const params = new URLSearchParams({
      template: "component-request.yml",
      title: `[Component]: ${name.trim()}`,
      name: name.trim(),
      category,
      details: details.trim(),
      reference: reference.trim(),
    });
    return `${siteConfig.issues}/new?${params.toString()}`;
  };

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (!name.trim()) return;
        window.open(issueUrl(), "_blank", "noopener,noreferrer");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Component"
          placeholder="Command palette"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={missingName ? "Give it a name, even a rough one." : undefined}
          maxLength={60}
        />
        <Select label="Category" options={categories} value={category} onValueChange={setCategory} />
      </div>
      <Textarea
        label="What should it do?"
        description="The use case matters more than the look. What are you building?"
        placeholder="A ⌘K menu with grouped results, recent items and a neon highlight that follows the keyboard."
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        maxLength={1000}
        showCount
      />
      <Input
        label="Reference"
        description="Optional. A link to something similar you like."
        placeholder="https://"
        type="url"
        value={reference}
        onChange={(event) => setReference(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" variant="solid">
          Open the request on GitHub <ArrowUpRight />
        </Button>
        <Button asChild variant="ghost">
          <a
            href={shareOnX(
              `@${siteConfig.author.handle} NeonKit needs a ${name.trim() || "___"} component`,
              `${siteConfig.url}/request`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            Or ask on X
          </a>
        </Button>
      </div>
      <p className="text-[13.5px] text-muted">
        GitHub opens with everything filled in. You check it over and submit it there.
      </p>
    </form>
  );
}
