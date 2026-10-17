import { SourceList, type Source } from "@/components/ui/sources";

const SOURCES: Source[] = [
  {
    title: "Content Security Policy Level 3",
    url: "https://www.w3.org/TR/CSP3/#strict-dynamic-usage",
    meta: "W3C Working Draft",
    date: "2025-06-20",
    snippet:
      "'strict-dynamic' allows scripts loaded by an already trusted script to execute, and ignores allowlists such as 'self' or https: when it is present.",
  },
  {
    title: "Mitigate cross-site scripting (XSS) with a strict Content Security Policy",
    url: "https://web.dev/articles/strict-csp",
    meta: "web.dev",
    date: "2024-03-15",
    snippet: "A nonce-based strict CSP is the recommended approach for server-rendered pages; hash-based for static ones.",
  },
  {
    title: "CSP nonce is the same on every request to /pricing",
    url: "https://git.nightshift.dev/web/storefront/issues/388",
    meta: "Issue #388",
    date: "2022-12-05",
    snippet: "A per-request nonce needs dynamic rendering. Statically rendered pages get the nonce from build time.",
  },
];

export default function SourcesList() {
  return <SourceList sources={SOURCES} label="Sources for the CSP answer" className="w-full max-w-xl" />;
}
