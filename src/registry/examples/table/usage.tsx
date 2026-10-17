import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const usage = [
  { resource: "Function invocations", included: "1M", used: "1.38M", cost: 7.6 },
  { resource: "Edge requests", included: "10M", used: "8.2M", cost: 0 },
  { resource: "Fast data transfer", included: "1 TB", used: "1.24 TB", cost: 36 },
  { resource: "Build minutes", included: "6,000", used: "4,410", cost: 0 },
  { resource: "Image optimizations", included: "5,000", used: "7,920", cost: 14.6 },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const total = usage.reduce((sum, row) => sum + row.cost, 0);

export default function TableUsage() {
  return (
    <Table density="compact" containerClassName="max-w-xl">
      <TableCaption>Billing period Oct 1 – Oct 31, 2026. Usage refreshes every hour.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead align="right">Included</TableHead>
          <TableHead align="right">Used</TableHead>
          <TableHead align="right">Overage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usage.map((row) => (
          <TableRow key={row.resource}>
            <TableCell className="whitespace-nowrap text-white/90">{row.resource}</TableCell>
            <TableCell align="right" className="whitespace-nowrap text-white/50">
              {row.included}
            </TableCell>
            <TableCell align="right" className="whitespace-nowrap">
              {row.used}
            </TableCell>
            <TableCell align="right" className={row.cost > 0 ? "whitespace-nowrap text-white/90" : "text-white/45"}>
              {row.cost > 0 ? currency.format(row.cost) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableHead colSpan={3}>Total overage</TableHead>
          <TableCell align="right">{currency.format(total)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
