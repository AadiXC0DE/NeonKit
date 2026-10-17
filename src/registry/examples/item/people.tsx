import { Ellipsis } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const members = [
  { name: "Ana Lima", email: "ana@acme.dev", role: "Owner", initials: "AL", status: "online" as const, you: true },
  { name: "Tomás Okafor", email: "tomas@acme.dev", role: "Admin", initials: "TO", status: "away" as const },
  { name: "Mei Takahashi", email: "mei@acme.dev", role: "Member", initials: "MT", status: "offline" as const },
];

export default function ItemPeople() {
  return (
    <ItemGroup className="min-w-0 w-full max-w-xl gap-1">
      {members.map((member) => (
        <Item key={member.email} size="sm">
          <ItemMedia>
            <Avatar fallback={member.initials} status={member.status} alt={member.name} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              <span>{member.name}</span>
              {member.you && (
                <Badge size="sm" variant="soft">
                  You
                </Badge>
              )}
            </ItemTitle>
            <ItemDescription lines={1}>
              {member.email}
              <span className="sm:hidden"> · {member.role}</span>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="hidden text-[13px] text-white/55 sm:inline">{member.role}</span>
            <Button variant="ghost" size="icon" className="size-8" aria-label={`Options for ${member.name}`}>
              <Ellipsis />
            </Button>
          </ItemActions>
        </Item>
      ))}
      <Item size="sm" variant="muted">
        <ItemMedia>
          <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-white/20 text-[12px] text-white/50">
            JR
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-white/70">jonas@riverline.studio</ItemTitle>
          <ItemDescription lines="none">Invited by Ana, 2 days ago. Expires Friday.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="sm">
            Resend
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}
