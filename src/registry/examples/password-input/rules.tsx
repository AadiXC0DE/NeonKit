"use client";

import { PasswordInput, type PasswordRule, type PasswordStrength } from "@/components/ui/password-input";

const ROLE = "deploy_bot";

// A connection string breaks on quotes and backslashes, so this policy cares more about those than symbols.
const rules: PasswordRule[] = [
  { id: "length", label: "24 or more characters", test: (v) => v.length >= 24 },
  { id: "quotes", label: "No quotes or backslashes", test: (v) => v.length > 0 && !/['"`\\]/.test(v) },
  { id: "spaces", label: "No spaces", test: (v) => v.length > 0 && !/\s/.test(v) },
  {
    id: "role",
    label: (
      <>
        Doesn’t contain <span className="font-mono">{ROLE}</span>
      </>
    ),
    test: (v) => v.length > 0 && !v.toLowerCase().includes(ROLE),
  },
];

const labels = ["", "Rejected", "Rejected", "Almost", "Accepted"];

// Score by the policy instead of the built-in estimate: one segment per rule passed.
function evaluate(value: string, passed: Record<string, boolean>): PasswordStrength {
  if (!value) return { score: 0, label: "" };
  const count = Object.values(passed).filter(Boolean).length as PasswordStrength["score"];
  return { score: Math.max(1, count) as PasswordStrength["score"], label: labels[Math.max(1, count)] };
}

export default function PasswordInputRules() {
  return (
    <div className="w-full max-w-sm">
      <PasswordInput
        label="Service account password"
        defaultValue={'deploy_bot-"prod"-2026'}
        rules={rules}
        strength
        evaluate={evaluate}
        description="Stored in Vault at secret/ci/deploy_bot. Rotated every 90 days."
      />
    </div>
  );
}
