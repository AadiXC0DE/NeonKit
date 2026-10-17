import { Pagination } from "@/components/ui/pagination";

export default function PaginationSizes() {
  return (
    <div className="grid justify-items-center gap-5">
      <Pagination size="sm" pageCount={9} defaultPage={2} aria-label="Pagination, small" />
      <Pagination size="md" pageCount={9} defaultPage={5} aria-label="Pagination, medium" />
      <Pagination size="lg" pageCount={9} defaultPage={8} aria-label="Pagination, large" />
    </div>
  );
}
