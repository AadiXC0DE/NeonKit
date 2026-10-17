import type { Metadata } from "next";
import { PageShell } from "@/components/site/page-shell";
import { PageHeader, textLink } from "@/components/site/prose";
import { RequestForm } from "@/components/site/request-form";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { registry } from "@/registry";

export const metadata: Metadata = {
  title: "Request a component",
  description: "Tell us which neon component NeonKit should build next. Requests become GitHub issues anyone can upvote.",
  alternates: { canonical: "/request" },
};

const steps = [
  ["You describe it", "A name and what you're building with it. Screenshots and links help."],
  ["It becomes a GitHub issue", "Public, so anyone who wants the same thing can add a thumbs-up."],
  ["The most wanted ships first", "Requests are built in order of votes, then by how many blocks they'd unlock."],
];

export default function RequestPage() {
  return (
    <PageShell>
      <div className="grid gap-20 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-7">
          <PageHeader title="What should we light up next?" size="lg" className="mb-12">
            {registry.length} components so far. If the one you need isn&apos;t one of them, ask for it here.
          </PageHeader>
          <div className="max-w-2xl">
            <RequestForm />
          </div>
        </div>

        <aside aria-labelledby="next-title" className="lg:col-span-4 lg:col-start-9 lg:pt-[13.5rem]">
          <h2 id="next-title" className="text-[15px] font-medium text-fg">
            What happens next
          </h2>
          <ol className="mt-6 space-y-7">
            {steps.map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
                <span className="text-[15px] font-medium tabular-nums text-muted">{i + 1}</span>
                <div>
                  <p className="text-[15px] font-medium text-fg">{title}</p>
                  <p className="mt-1 text-[14.5px] leading-[1.6] text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <a
            href={`${siteConfig.issues}?q=is%3Aissue+label%3Acomponent-request+sort%3Areactions-%2B1-desc`}
            target="_blank"
            rel="noreferrer"
            className={cn(textLink, "mt-10 inline-block text-[14.5px]")}
          >
            See what&apos;s already been asked for
          </a>
        </aside>
      </div>
    </PageShell>
  );
}
