import { ChatMessage } from "@/components/ui/chat-message";
import { Citation, SourceList, Sources, type Source } from "@/components/ui/sources";

const SOURCES: Source[] = [
  {
    title: "Date and Time on the Internet: Timestamps",
    url: "https://www.rfc-editor.org/rfc/rfc3339#section-5.6",
    meta: "RFC 3339, § 5.6",
    date: "2002-07",
    snippet:
      "This document defines a date and time format for use in Internet protocols that is a profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.",
  },
  {
    title: "8.5. Date/Time Types",
    url: "https://www.postgresql.org/docs/17/datatype-datetime.html",
    meta: "PostgreSQL 17",
    date: "2024-09-26",
    snippet:
      "For timestamp with time zone, the internally stored value is always in UTC. An input value that has an explicit time zone specified is converted to UTC using the appropriate offset for that time zone.",
  },
  {
    title: "Order timestamps come back an hour off in eu-central",
    url: "https://git.nightshift.dev/platform/orders-api/issues/2141",
    meta: "Issue #2141",
    date: "2020-03-18",
    snippet:
      "Columns of type timestamp come back as Dates built in the process's local time. On a host set to Europe/Berlin every value is an hour off from what psql shows.",
  },
  {
    title: "Date.prototype.toISOString()",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString",
    meta: "MDN",
    date: "2025-07-10",
    snippet: "The timezone is always UTC, as denoted by the suffix Z.",
  },
  {
    title: "Don't Do This: timestamp (without time zone)",
    url: "https://wiki.postgresql.org/wiki/Don%27t_Do_This",
    meta: "PostgreSQL wiki",
    date: "2024-02-14",
    snippet:
      "Don't use the timestamp type to store timestamps, use timestamptz (also known as timestamp with time zone) instead.",
  },
];

const code = "rounded-[5px] bg-white/[0.07] px-[0.38em] py-[0.12em] font-mono text-[0.86em] text-white/90";

export default function SourcesDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-8">
      <ChatMessage
        from="user"
        name="Ines Duarte"
        time="09:41"
        content="Our API returns created_at as 2026-10-17 09:30:00 with no zone and the mobile team keeps showing times an hour off. Should the column be timestamp or timestamptz, and what should go over the wire?"
      />
      <ChatMessage from="assistant" name="Argon" time="09:41" copyText="Store it as timestamptz and send RFC 3339 with an offset.">
        <Sources sources={SOURCES} className="grid gap-6">
          <div className="grid gap-3.5 text-[15px] leading-[1.65] text-white/[0.86]">
            <p>
              Make the column <code className={code}>timestamptz</code>. Postgres converts every input to UTC and stores
              that instant, so the value no longer depends on the zone of whoever wrote it
              <Citation index={2} />. The wiki is blunter: plain <code className={code}>timestamp</code> is for wall-clock
              times, never for moments
              <Citation index={5} />.
            </p>
            <p>
              On the wire, send RFC 3339 with an explicit offset, <code className={code}>2026-10-17T08:30:00Z</code>
              <Citation index={1} />
              . In the browser, <code className={code}>toISOString()</code> already produces that form
              <Citation index={4} />. The hour you&apos;re losing is already in your tracker: the driver parses zone-less
              columns in the server&apos;s local time
              <Citation index={3} />.
            </p>
          </div>
          <SourceList className="border-t border-white/[0.07] pt-4" />
        </Sources>
      </ChatMessage>
    </div>
  );
}
