import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const endpoints = [
  { method: "GET", path: "/api/projects" },
  { method: "GET", path: "/api/projects/halcyon-web/deployments" },
  { method: "POST", path: "/api/auth/session" },
  { method: "GET", path: "/api/search?q=table" },
  { method: "PATCH", path: "/api/billing/invoices/INV-2038" },
  { method: "GET", path: "/api/teams/core/members" },
  { method: "POST", path: "/api/webhooks/github" },
  { method: "DELETE", path: "/api/tokens/tok_9c2f" },
  { method: "GET", path: "/r/table.json" },
];

const codes = [200, 200, 304, 200, 201, 200, 429, 200, 204, 404, 200, 500, 200, 401];

// Deterministic, so the server and client render the same rows.
const requests = Array.from({ length: 36 }, (_, i) => {
  const endpoint = endpoints[(i * 4) % endpoints.length];
  const seconds = 59 - ((i * 7) % 60);
  return {
    id: i,
    time: `14:${String(59 - Math.floor((i * 7) / 60)).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    ...endpoint,
    status: codes[i % codes.length],
    latency: 18 + ((i * 53) % 340),
  };
});

const statusClass = (status: number) =>
  status >= 500 ? "text-[#ff4d5e]" : status >= 400 ? "text-[#fbbf24]" : "text-white/60";

export default function TableStickyHeader() {
  return (
    <ScrollArea
      orientation="both"
      fade={false}
      aria-label="Request log"
      className="h-80 w-full max-w-2xl rounded-xl border border-white/10 bg-white/[0.02]"
    >
      <Table
        stickyHeader
        density="compact"
        containerClassName="overflow-visible rounded-none border-0 bg-transparent"
      >
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead align="right">Status</TableHead>
            <TableHead align="right" className="pr-5">
              Latency
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono text-xs text-white/50">{request.time}</TableCell>
              <TableCell className="font-mono text-xs text-white/70">{request.method}</TableCell>
              <TableCell className="whitespace-nowrap font-mono text-xs text-white/90">{request.path}</TableCell>
              <TableCell align="right" className={`font-mono text-xs ${statusClass(request.status)}`}>
                {request.status}
              </TableCell>
              <TableCell align="right" className="pr-5 font-mono text-xs text-white/55">
                {request.latency} ms
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
