"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Hash } from "@/components/ui/icons";

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";

import { installCommands, repoUrl } from "./config";
import { docHref, docs, groups } from "./docs";
import { copyText } from "./highlight";
import { GitHubIcon } from "./logo";

/**
 * Word-start and substring matching only. The palette's default fuzzy matcher also accepts
 * scattered letters, which across ~40 section titles surfaces too much noise for docs.
 */
function filter(value: string, search: string, keywords: string[] = []) {
  const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const fields = [value, ...keywords].map((field) => field.toLowerCase());
  let total = 0;
  for (const term of terms) {
    let best = 0;
    fields.forEach((field, index) => {
      const at = field.indexOf(term);
      if (at === -1) return;
      const wordStart = at === 0 || /[\s\-_/.:#·]/.test(field[at - 1]);
      best = Math.max(best, (at === 0 ? 1 : wordStart ? 0.8 : 0.4) * (index === 0 ? 1 : 0.9));
    });
    if (!best) return 0;
    total += best;
  }
  return total / terms.length;
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return <span className="text-white/55">{children}</span>;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const searching = query.trim() !== "";

  function setOpen(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      setCopied(false);
    }
  }

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(copyText(installCommands.npm, "sh"));
      setCopied(true);
      window.setTimeout(() => setOpen(false), 650);
    } catch {
      setOpen(false);
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} label="Search the docs" filter={filter}>
      <CommandInput placeholder="Search pages and sections…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>
          Nothing matches <span className="text-white/80">“{query.trim()}”</span>. Try a command name like{" "}
          <span className="font-mono text-white/80">build</span>.
        </CommandEmpty>

        {groups.map((group) => (
          <CommandGroup key={group} heading={<GroupHeading>{group}</GroupHeading>}>
            {docs
              .filter((doc) => doc.group === group)
              .map((doc) => (
                <CommandItem
                  key={doc.slug}
                  value={doc.title}
                  keywords={[doc.group, doc.slug.replace("/", " "), ...(doc.headline ? [doc.headline] : [])]}
                  onSelect={() => go(docHref(doc.slug))}
                  className={doc.mono ? "font-mono text-[13px]" : undefined}
                >
                  {doc.title}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}

        {/* Sections only join the list once you type, so the resting palette stays short. */}
        {searching &&
          docs.map((doc) => (
            <CommandGroup key={`sections-${doc.slug}`} heading={<GroupHeading>{doc.title}</GroupHeading>}>
              {doc.headings.map((heading) => (
                <CommandItem
                  key={heading.id}
                  value={`${heading.title} · ${doc.title}`}
                  icon={<Hash />}
                  onSelect={() => go(docHref(doc.slug, heading.id))}
                >
                  {heading.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

        <CommandGroup heading={<GroupHeading>Actions</GroupHeading>}>
          <CommandItem value="Copy install command" keywords={["npm", "install"]} icon={<Copy />} onSelect={copyInstall}>
            {copied ? "Copied to clipboard" : "Copy install command"}
          </CommandItem>
          <CommandItem
            value="Open the GitHub repository"
            keywords={["source", "issues", "repo"]}
            icon={<GitHubIcon />}
            onSelect={() => {
              setOpen(false);
              window.open(repoUrl, "_blank", "noopener,noreferrer");
            }}
          >
            Open the GitHub repository
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2.5 text-xs text-white/55">
        <span className="flex items-center gap-1.5">
          <Kbd size="sm">↑</Kbd>
          <Kbd size="sm">↓</Kbd>
          to move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd size="sm">↵</Kbd>
          to open
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:flex">
          <Kbd size="sm">esc</Kbd>
          to close
        </span>
      </div>
    </CommandDialog>
  );
}
