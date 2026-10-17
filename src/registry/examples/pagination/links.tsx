"use client";

import { Pagination } from "@/components/ui/pagination";

export default function PaginationLinks() {
  return (
    <Pagination
      pageCount={40}
      defaultPage={20}
      siblingCount={2}
      // In an app this returns a real URL, such as `/changelog?page=${page}`.
      getHref={(page) => `#changelog-page-${page}`}
    />
  );
}