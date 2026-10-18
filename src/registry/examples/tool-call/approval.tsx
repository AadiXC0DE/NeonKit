"use client";

import * as React from "react";
import { ToolCall, type ToolCallStatus } from "@/components/ui/tool-call";

const QUERY = `DELETE FROM sessions
WHERE expires_at < now() - interval '30 days';`;

export default function ToolCallApproval() {
  const [status, setStatus] = React.useState<ToolCallStatus>("approval");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const approve = () => {
    setStatus("running");
    timer.current = setTimeout(() => setStatus("success"), 1600);
  };

  return (
    <div className="grid w-full max-w-xl gap-3">
      <ToolCall
        name="run_sql"
        summary="DELETE FROM sessions WHERE expires_at < now() - interval '30 days'"
        args={{ database: "prod-eu-1", statement: QUERY }}
        status={status}
        duration={status === "success" ? 1.42 : undefined}
        meta={status === "success" ? "48,210 rows" : undefined}
        result={status === "success" ? "DELETE 48210" : undefined}
        resultLanguage="sql"
        approvalNote="Deletes about 48,210 rows on prod-eu-1. Sessions can't be restored, but users only have to sign in again."
        approveLabel="Run on prod"
        onApprove={approve}
        onDeny={() => setStatus("denied")}
      />
      {status !== "approval" && status !== "running" && (
        <button
          type="button"
          onClick={() => setStatus("approval")}
          className="w-fit cursor-pointer rounded-md px-1 text-[13px] text-white/55 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          Ask again
        </button>
      )}
    </div>
  );
}
