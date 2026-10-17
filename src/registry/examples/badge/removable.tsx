"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initialFilters = ["TypeScript", "MIT license", "Updated this week", "Has examples"];

export default function BadgeRemovable() {
  const [filters, setFilters] = React.useState(initialFilters);

  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/50">
          {filters.length} {filters.length === 1 ? "filter" : "filters"} applied
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={filters.length === initialFilters.length}
          onClick={() => setFilters(initialFilters)}
        >
          Reset
        </Button>
      </div>
      <div className="flex min-h-6 flex-wrap gap-2">
        {filters.map((filter) => (
          <Badge
            key={filter}
            variant="outline"
            removeLabel={`Remove ${filter} filter`}
            onRemove={() => setFilters((current) => current.filter((item) => item !== filter))}
          >
            {filter}
          </Badge>
        ))}
        {filters.length === 0 && <p className="text-sm text-white/50">No filters. Showing every component.</p>}
      </div>
    </div>
  );
}
