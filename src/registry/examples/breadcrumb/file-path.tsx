"use client";

import * as React from "react";
import { FileCode, Folder } from "@/components/ui/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// null marks a file.
type Tree = { [name: string]: Tree | null };

const repo: Tree = {
  src: {
    components: {
      ui: { "breadcrumb.tsx": null, "pagination.tsx": null, "sidebar.tsx": null, "stepper.tsx": null },
      site: { "code-block.tsx": null, "docs-nav.tsx": null, "search.tsx": null },
    },
    lib: { "neon.ts": null, "utils.ts": null },
    registry: { "registry.json": null, "types.ts": null },
  },
  tests: { "registry.test.ts": null, "setup.ts": null },
  "package.json": null,
  "README.md": null,
};

function folderAt(path: string[]) {
  return path.reduce<Tree>((tree, name) => tree[name] ?? tree, repo);
}

export default function BreadcrumbFilePath() {
  const [path, setPath] = React.useState(["src", "components", "ui"]);
  const [file, setFile] = React.useState<string | null>("sidebar.tsx");

  const entries = Object.entries(folderAt(path)).sort(
    ([a, aTree], [b, bTree]) => Number(aTree === null) - Number(bTree === null) || a.localeCompare(b),
  );
  const crumbs = ["neonkit", ...path];

  function open(depth: number) {
    setPath(path.slice(0, depth));
    setFile(null);
  }

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 px-4 py-3">
        <Breadcrumb maxItems={4} aria-label="File path">
          <BreadcrumbList className="font-mono text-[13px] sm:gap-1.5">
            {crumbs.map((name, depth) => {
              const isLast = depth === crumbs.length - 1 && !file;
              return (
                <React.Fragment key={`${depth}-${name}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        <Folder aria-hidden />
                        {name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button type="button" className="cursor-pointer" onClick={() => open(depth)}>
                          {depth === 0 && <Folder aria-hidden />}
                          {name}
                        </button>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                </React.Fragment>
              );
            })}
            {file && (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <FileCode aria-hidden />
                  {file}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ul className="grid h-[188px] content-start gap-px overflow-y-auto p-2">
        {entries.map(([name, tree]) => {
          const selected = name === file;
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => {
                  if (tree) {
                    setPath([...path, name]);
                    setFile(null);
                  } else {
                    setFile(name);
                  }
                }}
                className={
                  "flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-left font-mono text-[13px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] " +
                  (selected
                    ? "bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))]"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white/90")
                }
              >
                {tree ? (
                  <Folder aria-hidden className="size-3.5 shrink-0 text-white/40" />
                ) : (
                  <FileCode aria-hidden className="size-3.5 shrink-0 opacity-60" />
                )}
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
