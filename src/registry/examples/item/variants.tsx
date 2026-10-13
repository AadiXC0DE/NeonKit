import { CreditCard } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const rows = [
  { variant: "default", size: "sm", label: "Default, sm" },
  { variant: "outline", size: "md", label: "Outline, md" },
  { variant: "muted", size: "lg", label: "Muted, lg" },
] as const;

export default function ItemVariants() {
  return (
    <div className="flex min-w-0 w-full max-w-xl flex-col gap-3">
      {rows.map((row) => (
        <Item key={row.label} variant={row.variant} size={row.size}>
          <ItemMedia variant="icon">
            <CreditCard />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Visa ending 4242</ItemTitle>
            <ItemDescription>{row.label} · expires 08/29</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  );
}
