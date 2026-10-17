import { AgentPlan } from "@/components/ui/agent-plan";

export default function AgentPlanResearch() {
  return (
    <AgentPlan
      className="w-full max-w-md"
      title="Why did Team churn triple in September?"
      steps={[
        {
          title: "Count cancellations by plan",
          status: "done",
          meta: "637 rows",
          description: "Team 412, Starter 188, Business 37. Only Team moved.",
        },
        {
          title: "Line it up with incidents",
          status: "done",
          substeps: [
            { title: "Status page, September", status: "done", meta: "3 incidents" },
            { title: "Release notes, 2.11 to 2.13", status: "done", meta: "41 entries" },
          ],
        },
        {
          title: "Split Team cancellations by failed invites",
          status: "active",
          substeps: [
            { title: "Join invites to workspaces", status: "done", meta: "18,904" },
            { title: "Flag a failed invite in the 14 days before canceling", status: "active" },
          ],
        },
        { title: "Write up the finding with a chart", status: "pending" },
      ]}
    />
  );
}
