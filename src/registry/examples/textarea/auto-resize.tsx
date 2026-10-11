import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const review = `Looks good overall. Two things before we merge:

1. The popover clips inside overflow-hidden parents.
2. Typeahead should reset after 500ms, not on blur.

Happy to pair on either.`;

export default function TextareaAutoResize() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Textarea
        aria-label="Review comment"
        placeholder="Leave a review comment"
        defaultValue={review}
        minRows={2}
        maxRows={8}
        description="Grows with each line up to 8, then scrolls."
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button variant="solid" size="sm">
          Comment
        </Button>
      </div>
    </div>
  );
}
