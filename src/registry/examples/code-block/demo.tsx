import { CodeBlock } from "@/components/ui/code-block";

const files = [
  {
    filename: "app/api/invites/route.ts",
    highlight: [8],
    code: `import { NextResponse } from "next/server";
import { sendInvite } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  // Five invites a minute per address is plenty for a person and useless for a script.
  const { ok, remaining } = await rateLimit(\`invites:\${ip}\`, 5);

  if (!ok) {
    return NextResponse.json(
      { error: "Too many invites. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { email } = await request.json();
  await sendInvite(email);
  return NextResponse.json({ sent: true }, { headers: { "X-RateLimit-Remaining": String(remaining) } });
}`,
  },
  {
    filename: "lib/rate-limit.ts",
    highlight: [[7, 8]] as [number, number][],
    code: `import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function rateLimit(key: string, limit = 20, window = 60) {
  const bucket = \`rl:\${key}:\${Math.floor(Date.now() / 1000 / window)}\`;
  const count = await redis.incr(bucket);
  if (count === 1) await redis.expire(bucket, window);
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}`,
  },
  {
    filename: ".env.example",
    language: "bash",
    code: `# Redis for rate limiting. Create a free database at console.upstash.com
UPSTASH_REDIS_REST_URL=https://eu1-example-41022.upstash.io
UPSTASH_REDIS_REST_TOKEN=`,
  },
];

export default function CodeBlockDemo() {
  return <CodeBlock files={files} className="w-full max-w-2xl" />;
}
