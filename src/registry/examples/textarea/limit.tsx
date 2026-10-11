import { Textarea } from "@/components/ui/textarea";

const bio =
  "Design engineer at a small studio in Lisbon. I build component libraries, tinker with shaders and collect old synths.";

export default function TextareaLimit() {
  return (
    <Textarea
      label="Bio"
      defaultValue={bio}
      maxLength={120}
      showCount
      minRows={2}
      description="Shown on your public profile."
      containerClassName="max-w-md"
    />
  );
}
