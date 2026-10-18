import { Rocket } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function EmptyDemo() {
  return (
    <Empty>
      <EmptyMedia variant="tube">
        <Rocket />
      </EmptyMedia>
      <EmptyTitle>No deployments yet</EmptyTitle>
      <EmptyDescription>
        Push to <code className="font-mono text-[13px] text-white/80">main</code> and acme-web builds on its own,
        or ship the current branch from here.
      </EmptyDescription>
      <EmptyContent>
        <Button variant="solid">Deploy main</Button>
        <Button variant="ghost" asChild>
          <a href="#cli">Use the CLI</a>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
