import { BookMarked, GitFork, Star } from "@/components/ui/icons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function HoverCardRepository() {
  return (
    <p className="max-w-sm text-center text-sm leading-6 text-white/55">
      The runtime is open source. Read the code at{" "}
      <HoverCard openDelay={300}>
        <HoverCardTrigger href="#edge-runtime" className="font-mono text-[13px]">
          northlight/edge-runtime
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-80 text-left">
          <p className="flex items-center gap-2 text-sm font-medium text-white/90">
            <BookMarked aria-hidden className="size-4 text-white/50" />
            northlight/edge-runtime
          </p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            A V8 isolate runtime for request handlers, with streaming responses and a 5 ms cold start.
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-[#3178c6]" /> TypeScript
            </span>
            <span className="flex items-center gap-1">
              <Star aria-hidden className="size-3.5" /> 4.8k
            </span>
            <span className="flex items-center gap-1">
              <GitFork aria-hidden className="size-3.5" /> 312
            </span>
            <span className="ml-auto">Updated 3 days ago</span>
          </div>
        </HoverCardContent>
      </HoverCard>
      .
    </p>
  );
}
