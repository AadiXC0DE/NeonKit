import { Leaf, Users, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const plans = [
  { value: "hobby", name: "Hobby", icon: <Leaf />, price: "$0", detail: "For side projects" },
  { value: "pro", name: "Pro", icon: <Zap />, price: "$20", detail: "Unlimited projects" },
  { value: "team", name: "Team", icon: <Users />, price: "$48", detail: "10 seats and SSO" },
];

export default function RadioGroupPlanPicker() {
  return (
    <RadioGroup
      variant="card"
      orientation="horizontal"
      defaultValue="pro"
      aria-label="Plan"
      className="w-full max-w-xl"
    >
      {plans.map((plan) => (
        <RadioGroupItem key={plan.value} value={plan.value} label={plan.name} icon={plan.icon}>
          <span className="block text-2xl font-semibold tracking-tight text-white">
            {plan.price}
            <span className="text-sm font-normal tracking-normal text-white/55"> / month</span>
          </span>
          <span className="mt-1 block text-[13px] leading-[18px] text-white/55">{plan.detail}</span>
        </RadioGroupItem>
      ))}
    </RadioGroup>
  );
}
