import { Citation, Sources, type Source } from "@/components/ui/sources";

const SOURCES: Source[] = [
  {
    title: "CREATE INDEX",
    url: "https://www.postgresql.org/docs/17/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY",
    meta: "PostgreSQL 17",
    date: "2024-09-26",
    snippet: "Builds the index without taking any locks that prevent concurrent inserts, updates, or deletes on the table.",
  },
  {
    title: "Migration hangs forever on CREATE INDEX CONCURRENTLY",
    url: "https://git.nightshift.dev/platform/migrations/issues/14",
    meta: "Issue #14",
    date: "2022-07-25",
    snippet:
      "The migration sat at 0% for forty minutes. pg_stat_activity showed it waiting on a virtualxid lock held by an idle-in-transaction session from a REPL someone left open.",
  },
];

export default function SourcesQuotes() {
  return (
    <Sources sources={SOURCES} className="w-full max-w-xl">
      <p className="text-[15px] leading-[1.7] text-white/[0.86]">
        <code className="font-mono text-[0.86em] text-white/90">CONCURRENTLY</code> makes two passes over the table and,
        between them, waits for every transaction that could still see the old rows to finish
        <Citation
          index={1}
          quote="PostgreSQL must perform two scans of the table, and in addition it must wait for all existing transactions that could potentially modify or use the index to terminate."
        />
        . One forgotten <code className="font-mono text-[0.86em] text-white/90">idle in transaction</code> session is
        enough to stall it indefinitely
        <Citation index={2} />, and it can&apos;t run inside a transaction block at all
        <Citation
          index={1}
          quote="Another difference is that a regular CREATE INDEX command can be performed within a transaction block, but CREATE INDEX CONCURRENTLY cannot."
        />
        .
      </p>
    </Sources>
  );
}
