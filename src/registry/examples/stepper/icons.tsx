"use client";

import * as React from "react";
import { Building2, GitBranch, UserRound, UsersRound } from "lucide-react";
import { Step, Stepper } from "@/components/ui/stepper";

const steps = [
  { title: "Profile", icon: <UserRound />, hint: "Your name and avatar, as teammates will see them." },
  { title: "Workspace", icon: <Building2 />, hint: "Pick a name and a URL. You can change both later." },
  { title: "Invite team", icon: <UsersRound />, hint: "Send invites now, or skip and share a link later.", optional: true },
  { title: "Connect Git", icon: <GitBranch />, hint: "Import a repository to deploy on every push." },
];

export default function StepperIcons() {
  const [step, setStep] = React.useState(2);

  return (
    <div className="grid w-full max-w-xl gap-5">
      <Stepper value={step} onValueChange={setStep} clickable aria-label="Workspace setup">
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} optional={item.optional} />
        ))}
      </Stepper>
      <p aria-live="polite" className="text-center text-sm text-white/55">
        {steps[step].hint}
      </p>
    </div>
  );
}
