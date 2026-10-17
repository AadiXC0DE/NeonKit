import { TagInput } from "@/components/ui/tag-input";

const skills = [
  "TypeScript",
  "React",
  "Rust",
  "Go",
  "Python",
  "PostgreSQL",
  "GraphQL",
  "Kubernetes",
  "Terraform",
  "Figma",
  "Accessibility",
  "WebGL",
  "Swift",
  "Kotlin",
  "Elixir",
  "Product strategy",
  "Technical writing",
];

export default function TagInputSkills() {
  return (
    <TagInput
      label="Skills"
      placeholder="Add a skill"
      description="Pick from the list or type your own. Up to 8."
      suggestions={skills}
      defaultValue={["TypeScript", "Accessibility"]}
      max={8}
      containerClassName="max-w-sm"
    />
  );
}
