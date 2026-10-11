import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Hobby",
    price: "$0",
    period: "forever",
    description: "For side projects and trying things out.",
    features: ["3 projects", "Preview deployments", "Community support"],
    cta: "Start for free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "per seat / month",
    description: "For teams shipping to production every day.",
    features: ["Unlimited projects", "Preview deployments", "Password-protected previews", "Priority support"],
    cta: "Upgrade to Pro",
    featured: true,
  },
];

export default function CardPricing() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.name} variant={plan.featured ? "glow" : "default"}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{plan.name}</CardTitle>
              {plan.featured && (
                <span className="rounded-full border border-[rgb(var(--neon)/0.3)] bg-[rgb(var(--neon)/0.1)] px-2 py-0.5 text-[11px] font-medium text-[rgb(var(--neon))]">
                  Most popular
                </span>
              )}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-white">{plan.price}</span>
              <span className="text-sm text-white/45">{plan.period}</span>
            </p>
            <ul className="mt-6 grid gap-2.5 text-sm text-white/70">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <Check
                    aria-hidden
                    className={plan.featured ? "size-4 text-[rgb(var(--neon))]" : "size-4 text-white/35"}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant={plan.featured ? "solid" : "outline"} className="w-full">
              {plan.cta}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
