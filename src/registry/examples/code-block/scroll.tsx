import { CodeBlock } from "@/components/ui/code-block";

const code = `import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().email("That doesn't look like an email address. Check for a missing @ or a typo in the domain."),
  role: z.enum(["owner", "admin", "member", "viewer"], { message: "Pick a role: owner, admin, member or viewer." }),
  teamId: z.string().uuid("Team IDs are UUIDs. Copy it from Settings → Team → General, not from the URL."),
  expiresInDays: z.number().int().min(1).max(30).default(7),
  message: z.string().max(500, "Keep the note under 500 characters; it goes in the email subject preview.").optional(),
});

export type Invite = z.infer<typeof inviteSchema>;

export function parseInvite(input: unknown) {
  const result = inviteSchema.safeParse(input);
  if (!result.success) {
    return { ok: false as const, errors: result.error.flatten().fieldErrors };
  }
  return { ok: true as const, invite: result.data };
}

export function inviteExpiry(invite: Invite, now = new Date()) {
  const expires = new Date(now);
  expires.setDate(expires.getDate() + invite.expiresInDays);
  return expires;
}`;

export default function CodeBlockScroll() {
  return <CodeBlock filename="lib/invites/schema.ts" code={code} maxHeight={280} highlight={[[3, 9]]} className="w-full max-w-2xl" />;
}
