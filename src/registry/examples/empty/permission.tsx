"use client";

import * as React from "react";
import { CalendarDays } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function EmptyPermission() {
  const [role, setRole] = React.useState("viewer");
  const canSchedule = role === "admin";

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <ToggleGroup aria-label="Signed in as" size="sm" value={role} onValueChange={(value) => setRole(value as string)}>
        <ToggleGroupItem value="viewer">Viewer</ToggleGroupItem>
        <ToggleGroupItem value="admin">Admin</ToggleGroupItem>
      </ToggleGroup>
      <Empty>
        <EmptyMedia variant="tube">
          <CalendarDays />
        </EmptyMedia>
        <EmptyTitle>Nothing scheduled this week</EmptyTitle>
        <EmptyDescription>
          {canSchedule
            ? "Releases you schedule show up here, with who signed them off."
            : "Only admins can schedule releases. Ask Ana or Tomás to add one."}
        </EmptyDescription>
        <EmptyContent>{canSchedule && <Button>Schedule a release</Button>}</EmptyContent>
      </Empty>
    </div>
  );
}
