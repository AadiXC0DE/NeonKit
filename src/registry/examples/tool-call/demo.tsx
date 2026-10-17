"use client";

import * as React from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { ToolCall, ToolCallGroup, type ToolCallStatus } from "@/components/ui/tool-call";

const FAIL = ` FAIL  src/date.test.ts > addDays > keeps local midnight across the DST change
AssertionError: expected 2026-10-25T22:00:00.000Z to equal 2026-10-25T23:00:00.000Z

 ❯ src/date.test.ts:18:31
     17|     const start = new Date(2026, 9, 24);
     18|     expect(addDays(start, 2)).toEqual(new Date(2026, 9, 26));
       |                               ^

 Test Files  1 failed | 6 passed (7)
      Tests  1 failed | 13 passed (14)
   Duration  1.84s`;

const SOURCE = `const DAY = 86_400_000;

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}`;

const DIFF = ` export function addDays(date: Date, days: number) {
-  return new Date(date.getTime() + days * DAY);
+  const next = new Date(date);
+  next.setDate(next.getDate() + days);
+  return next;
 }`;

const PASS = ` ✓ src/date.test.ts (6 tests) 9ms
 ✓ src/format.test.ts (3 tests) 4ms
 ✓ src/range.test.ts (2 tests) 3ms

 Test Files  7 passed (7)
      Tests  14 passed (14)
   Duration  1.71s`;

type Row = {
  id: string;
  name: string;
  args?: Record<string, unknown>;
  summary?: string;
  status: ToolCallStatus;
  duration?: number;
  meta?: string;
  result?: string;
  resultLanguage?: string;
  preview?: boolean;
};

const TEST = { command: "TZ=Europe/Berlin npm test" };

export default function ToolCallDemo() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [run, setRun] = React.useState(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = React.useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const patch = React.useCallback((id: string, change: Partial<Row>) => {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, ...change } : row)));
  }, []);

  React.useEffect(() => {
    const add = (row: Row) => setRows((list) => [...list, row]);
    later(500, () => add({ id: "test-1", name: "run_command", args: TEST, status: "running" }));
    later(2300, () =>
      patch("test-1", { status: "error", duration: 1.84, meta: "1 failed", result: FAIL, resultLanguage: "bash" }),
    );
    later(2800, () => add({ id: "read", name: "read_file", args: { path: "src/date.ts" }, status: "running" }));
    later(3300, () => patch("read", { status: "success", duration: 0.1, result: SOURCE, resultLanguage: "ts" }));
    later(3800, () =>
      add({ id: "edit", name: "edit_file", summary: "src/date.ts", status: "approval", preview: true }),
    );
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      timers.current = [];
    };
  }, [run, later, patch]);

  const approve = () => {
    patch("edit", { status: "running" });
    later(600, () => {
      patch("edit", { status: "success", duration: 0.2, meta: "+3 −1" });
      setRows((list) => [...list, { id: "test-2", name: "run_command", args: TEST, status: "running" }]);
    });
    later(2400, () => patch("test-2", { status: "success", duration: 1.71, meta: "14 passed", result: PASS, resultLanguage: "bash" }));
  };

  const finished = rows.some((row) => row.id === "test-2" && row.status === "success") || rows.some((row) => row.status === "denied");

  return (
    <div className="grid w-full max-w-xl gap-3">
      <ToolCallGroup label="Run log" className="min-h-[41px]">
        {rows.map((row) => (
          <ToolCall
            key={row.id}
            name={row.name}
            args={row.args}
            summary={row.summary}
            status={row.status}
            duration={row.duration}
            meta={row.meta}
            result={row.result}
            resultLanguage={row.resultLanguage}
            approvalNote={
              <>
          Edits <span className="font-mono text-[12px] text-white/85">src/date.ts</span>: 3 lines in, 1 out.
              </>
            }
            onApprove={approve}
            onDeny={() => patch(row.id, { status: "denied" })}
          >
            {row.preview && (
              <CodeBlock
                code={DIFF}
                language="ts"
                diff
                header={false}
                lineNumbers={false}
                className="rounded-lg border-white/[0.06] bg-black/25 [&_.nk-code-scroll]:text-[12px]"
              />
            )}
          </ToolCall>
        ))}
      </ToolCallGroup>
      <div className="flex h-8 items-center justify-between gap-3 px-1 text-[13px] text-white/50">
        <span className="tabular-nums">
          {rows.length} {rows.length === 1 ? "call" : "calls"}
        </span>
        <button
          type="button"
          onClick={() => {
            setRows([]);
            setRun((n) => n + 1);
          }}
          className={`cursor-pointer rounded-md px-2 py-1 text-white/55 outline-none transition-[color,opacity] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] ${finished ? "opacity-100" : "pointer-events-none opacity-0"}`}
          tabIndex={finished ? 0 : -1}
        >
          Run again
        </button>
      </div>
    </div>
  );
}
