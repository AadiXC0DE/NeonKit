import { ToolCall, ToolCallGroup } from "@/components/ui/tool-call";

const SQL = `SELECT plan, count(*) AS churned, round(avg(seats), 1) AS avg_seats
FROM subscriptions
WHERE canceled_at >= '2026-09-01' AND canceled_at < '2026-10-01'
GROUP BY plan
ORDER BY churned DESC;`;

const ROWS = [
  { plan: "Team", churned: 412, seats: 6.3, change: "+212%" },
  { plan: "Starter", churned: 188, seats: 1.4, change: "+9%" },
  { plan: "Business", churned: 37, seats: 22.8, change: "−4%" },
];

function ResultTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-black/25">
      <table className="w-full min-w-[22rem] text-left text-[12.5px] tabular-nums">
        <thead className="text-white/45">
          <tr className="border-b border-white/[0.06]">
            <th className="px-3 py-2 font-normal">plan</th>
            <th className="px-3 py-2 text-right font-normal">churned</th>
            <th className="px-3 py-2 text-right font-normal">avg_seats</th>
            <th className="px-3 py-2 text-right font-normal">vs August</th>
          </tr>
        </thead>
        <tbody className="font-mono text-white/85">
          {ROWS.map((row) => (
            <tr key={row.plan} className="border-b border-white/[0.04] last:border-0">
              <td className="px-3 py-1.5">{row.plan}</td>
              <td className="px-3 py-1.5 text-right">{row.churned}</td>
              <td className="px-3 py-1.5 text-right">{row.seats}</td>
              <td className={`px-3 py-1.5 text-right ${row.plan === "Team" ? "text-[rgb(255_150_160)]" : "text-white/55"}`}>
                {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToolCallResearch() {
  return (
    <ToolCallGroup label="Research run" className="w-full max-w-xl">
      <ToolCall name="list_tables" args={{ schema: "billing" }} status="success" duration={0.3} meta="14 tables" />
      <ToolCall
        name="sql_query"
        summary="churn by plan, September 2026"
        args={{ warehouse: "analytics", sql: SQL }}
        status="success"
        duration={0.64}
        meta="3 rows"
        result={<ResultTable />}
        defaultOpen
      />
      <ToolCall
        name="fetch_url"
        args={{ url: "https://status.ledger.dev/incidents/2026-09-08" }}
        status="success"
        duration={1.2}
        meta="200"
        result="Sep 8, 14:10–19:45 UTC. Seat invitations failed for workspaces on the Team plan after the SSO rollout."
      />
    </ToolCallGroup>
  );
}
