import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Textarea
        label="Feedback"
        description="Goes straight to the team. We read every one."
        placeholder="What should we build next?"
        maxLength={280}
        showCount
      />
      <div className="flex justify-end">
        <Button variant="solid" size="sm">
          Send feedback
        </Button>
      </div>
    </div>
  );
}
