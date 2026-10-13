import { Cable } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function EmptyPanel() {
  return (
    <div className="grid min-w-0 w-full max-w-3xl overflow-hidden rounded-xl border border-white/[0.08] sm:grid-cols-[200px_1fr]">
      <nav aria-label="Settings" className="hidden flex-col gap-0.5 border-r border-white/[0.06] p-3 text-sm sm:flex">
        {["General", "Domains", "Webhooks", "Environment"].map((label) => (
          <span
            key={label}
            className={
              label === "Webhooks"
                ? "rounded-md bg-white/[0.06] px-2.5 py-1.5 text-white/90"
                : "px-2.5 py-1.5 text-white/55"
            }
          >
            {label}
          </span>
        ))}
      </nav>
      <Empty align="start" className="py-12 sm:px-10">
        <EmptyMedia variant="tube">
          <Cable />
        </EmptyMedia>
        <EmptyTitle>No webhooks</EmptyTitle>
        <EmptyDescription>
          Get a signed POST on every deploy, failed build or domain change. Most teams point one at Slack and
          one at their incident tool.
        </EmptyDescription>
        <EmptyContent>
          <Button variant="outline" size="sm">
            Add endpoint
          </Button>
          <a href="#events" className="px-2 text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white/80">
            See the 18 event types
          </a>
        </EmptyContent>
      </Empty>
    </div>
  );
}
