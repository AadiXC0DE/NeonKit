import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { RequestForm } from "@/components/site/request-form";
import { siteConfig } from "@/config/site";
import { registry } from "@/registry";

export const metadata: Metadata = {
  title: "Request a component",
  description: "Tell us which neon component NeonKit should build next. Requests become GitHub issues anyone can upvote.",
  alternates: { canonical: "/request" },
};

const steps = [
  ["Describe it", "A name and the use case. Screenshots and links help."],
  ["It lands on GitHub", "As an issue anyone can upvote with a thumbs-up."],
  ["Most wanted ships first", "Requests with the most votes go to the top of the queue."],
];

export default function RequestPage() {
  return (
    <PageShell>
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Request</p>
          <h1 className="text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg">
            What should we light up next?
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            {registry.length} components so far. If the one you need isn&apos;t here, ask for it.
          </p>
          <div className="mt-12 max-w-2xl">
            <RequestForm />
          </div>
        </div>

        <aside className="lg:pt-24">
          <div className="rounded-2xl border border-line bg-white/[0.015]">
            <h2 className="border-b border-line px-6 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
              What happens next
            </h2>
            <ol className="divide-y divide-line">
              {steps.map(([title, body], i) => (
                <li key={title} className="flex gap-4 px-6 py-5">
                  <span className="font-mono text-[11px] text-[rgb(var(--neon-accent))]">0{i + 1}</span>
                  <div>
                    <p className="text-[15px] font-medium text-fg">{title}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t border-line px-6 py-4">
              <a
                href={`${siteConfig.issues}?q=is%3Aissue+label%3Acomponent-request+sort%3Areactions-%2B1-desc`}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] text-fg underline decoration-white/20 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]"
              >
                See what&apos;s already been requested
              </a>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
