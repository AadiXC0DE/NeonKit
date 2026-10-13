import { MEMBERS, type RegionCode, type Role } from "../data";
import { team } from "../config";

export const NOTIFY = [
  { key: "prodFailed", label: "Production deploy failed", description: "The build or the health check failed and the previous version kept serving." },
  { key: "previewFailed", label: "Preview deploy failed", description: "Only for branches you pushed to." },
  { key: "prodReady", label: "Production deploy is live", description: "Every promotion to production, with the commit and who shipped it." },
  { key: "region", label: "Region degraded", description: "p95 above the SLO for five minutes in any region." },
  { key: "usage", label: "Usage passes 80%", description: "Build minutes, bandwidth, edge requests or function compute." },
  { key: "weekly", label: "Monday report", description: "Deploys, rollbacks and the slowest routes from last week." },
] as const;

export type NotifyKey = (typeof NOTIFY)[number]["key"];

export interface SettingsState {
  name: string;
  slug: string;
  region: RegionCode;
  branch: string;
  previews: boolean;
  notify: Record<NotifyKey, boolean>;
  channel: string;
  roles: Record<string, Role>;
  spendCap: string;
}

export const INITIAL: SettingsState = {
  name: team.name,
  slug: team.slug,
  region: "iad",
  branch: "main",
  previews: true,
  notify: { prodFailed: true, previewFailed: true, prodReady: false, region: true, usage: true, weekly: false },
  channel: "both",
  roles: Object.fromEntries(MEMBERS.map((m) => [m.id, m.role])),
  spendCap: "400",
};

export type SettingsErrors = Partial<Record<"name" | "slug" | "branch" | "spendCap", string>>;

export function validate(s: SettingsState): SettingsErrors {
  const errors: SettingsErrors = {};
  if (!s.name.trim()) errors.name = "The team needs a name.";
  if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(s.slug)) errors.slug = "3–32 lowercase letters, numbers or dashes.";
  if (!s.branch.trim() || /\s/.test(s.branch)) errors.branch = "Use a branch name without spaces, like main.";
  if (!/^\d+$/.test(s.spendCap)) errors.spendCap = "Whole dollars only, like 400. Use 0 for no extra spend.";
  return errors;
}

/** Which tab each field lives on, so the save bar can send you to the first error. */
export const TAB_OF: Record<keyof SettingsErrors, string> = { name: "general", slug: "general", branch: "general", spendCap: "billing" };
