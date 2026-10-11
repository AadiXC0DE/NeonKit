import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const variants = [
  { variant: "default", title: "Default", description: "A raised surface with a faint lit edge. Use it for most content." },
  { variant: "glow", title: "Glow", description: "Neon border and ambient light. Save it for the one card that matters." },
  { variant: "outline", title: "Outline", description: "Border only, for dense layouts and nested groups." },
] as const;

export default function CardVariants() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {variants.map((item) => (
        <Card key={item.variant} variant={item.variant}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
