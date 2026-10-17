import { Citation, SourceList, Sources, type Source } from "@/components/ui/sources";

const SOURCES: Source[] = [
  {
    title: "Additional HTTP Status Codes",
    url: "https://www.rfc-editor.org/rfc/rfc6585#section-4",
    meta: "RFC 6585",
    date: "2012-04",
    snippet:
      "The 429 status code indicates that the user has sent too many requests in a given amount of time. The response representations SHOULD include details explaining the condition, and MAY include a Retry-After header.",
  },
  {
    title: "HTTP Semantics: Retry-After",
    url: "https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3",
    meta: "RFC 9110",
    date: "2022-06",
    snippet:
      "Servers send the Retry-After header field to indicate how long the user agent ought to wait before making a follow-up request. Its value is either an HTTP-date or a number of seconds to delay.",
  },
  {
    title: "Rate limits for the REST API",
    url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api",
    date: "2025-05-02",
    snippet:
      "If you exceed a secondary rate limit, you will receive a 403 or 429 response. If the retry-after header is present, you should not retry your request until after that many seconds has elapsed.",
  },
  {
    title: "Exponential backoff and jitter",
    url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
    date: "2015-03-04",
    snippet: "Adding jitter spreads the retries out, so a burst of clients that failed together does not retry together.",
  },
  {
    title: "octokit/plugin-throttling.js",
    url: "https://github.com/octokit/plugin-throttling.js",
    date: "2025-08-21",
    snippet: "Implements all recommended best practices to prevent hitting secondary rate limits.",
  },
];

export default function SourcesChips() {
  return (
    <Sources sources={SOURCES} className="grid w-full max-w-xl gap-4">
      <p className="text-[15px] leading-[1.65] text-white/[0.86]">
        Answer with 429 and a <code className="font-mono text-[0.86em] text-white/90">Retry-After</code> in seconds
        <Citation index={1} />
        <Citation index={2} />. Clients should wait at least that long, then back off with jitter so they don&apos;t all
        come back in the same second
        <Citation index={4} />. GitHub&apos;s API documents exactly this contract
        <Citation index={3} />.
      </p>
      <SourceList variant="chips" max={3} />
    </Sources>
  );
}
