import { ToolCall, ToolCallGroup } from "@/components/ui/tool-call";

export default function ToolCallStates() {
  return (
    <ToolCallGroup label="Deploy run" className="w-full max-w-xl">
      <ToolCall
        name="git_status"
        args={{ cwd: "~/src/ledger" }}
        status="success"
        duration={0.2}
        result={"On branch fix/invoice-rounding\nnothing to commit, working tree clean"}
        resultLanguage="bash"
      />
      <ToolCall
        name="run_migration"
        args={{ name: "20261013_invoice_totals", env: "staging" }}
        status="error"
        duration={3.1}
        meta="exit 1"
        error={`column "total_cents" of relation "invoices" already exists. It ran on staging yesterday; mark it applied instead of re-running it.`}
      />
      <ToolCall name="deploy_preview" args={{ branch: "fix/invoice-rounding" }} status="running" />
      <ToolCall name="post_message" args={{ channel: "#releases", text: "ledger 2.14.1 is on staging" }} status="pending" />
      <ToolCall name="delete_branch" args={{ branch: "fix/invoice-rounding" }} status="denied" />
    </ToolCallGroup>
  );
}
