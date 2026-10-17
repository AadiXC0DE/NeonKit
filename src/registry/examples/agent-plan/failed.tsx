import { AgentPlan } from "@/components/ui/agent-plan";

export default function AgentPlanFailed() {
  return (
    <AgentPlan
      className="w-full max-w-md"
      title="Ship ledger 2.14.1 to staging"
      readout="Stopped at 3 of 5"
      steps={[
        { title: "Build the image", status: "done", meta: "48s" },
        { title: "Run the test suite", status: "done", meta: "212 passed" },
        {
          title: "Apply migrations",
          status: "failed",
          meta: "exit 1",
          description: "20261013_invoice_totals: column “total_cents” already exists.",
        },
        { title: "Swap traffic to the new release", status: "skipped" },
        { title: "Post to #releases", status: "skipped" },
      ]}
    />
  );
}
