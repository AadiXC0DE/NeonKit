"use client";

import { TagInput } from "@/components/ui/tag-input";

function validateTopic(tag: string) {
  if (tag.length > 24) return "Keep topics under 25 characters.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(tag)) return "Use lowercase letters, numbers and single dashes.";
  return true;
}

export default function TagInputTopics() {
  return (
    <TagInput
      label="Topics"
      placeholder="design-systems"
      description="Space, comma or Enter adds a topic. Five at most."
      separators={[" ", ",", "Enter"]}
      validate={validateTopic}
      max={5}
      defaultValue={["react", "tailwind", "neon"]}
      containerClassName="max-w-sm"
    />
  );
}
