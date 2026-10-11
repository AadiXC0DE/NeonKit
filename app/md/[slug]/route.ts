import { componentMarkdown } from "@/lib/markdown";
import { registry } from "@/registry";

// Served at /components/<slug>.md through a rewrite in next.config.ts.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return registry.map((item) => ({ slug: item.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const markdown = await componentMarkdown(slug);
  if (!markdown) return new Response("Not found", { status: 404 });
  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
