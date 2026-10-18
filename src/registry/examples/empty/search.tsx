"use client";

import * as React from "react";
import { SearchX } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function EmptySearch() {
  return (
    <Empty size="sm">
      <EmptyMedia variant="icon">
        <SearchX />
      </EmptyMedia>
      <EmptyTitle>No invoices match “Q3 refund”</EmptyTitle>
      <EmptyDescription>
        Filters: paid, last 90 days, EUR. Refunds are listed under Credit notes.
      </EmptyDescription>
      <EmptyContent>
        <Button variant="soft" size="sm">
          Clear filters
        </Button>
        <Button variant="ghost" size="sm">
          Search credit notes
        </Button>
      </EmptyContent>
    </Empty>
  );
}
