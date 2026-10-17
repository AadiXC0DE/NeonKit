import { CodeBlock } from "@/components/ui/code-block";

export default function CodeBlockLanguages() {
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <CodeBlock
        language="bash"
        lineNumbers={false}
        wrapToggle={false}
        code={`$ npx shadcn@latest add https://neonkit.heyaadi.com/r/code-block.json
$ NODE_ENV=production npm run build -- --profile`}
      />
      <CodeBlock
        filename="app/globals.css"
        wrapToggle={false}
        code={`:root {
  --neon-accent: 34 211 238;
}

.prose pre:hover {
  box-shadow: 0 0 24px rgb(var(--neon-accent) / 0.35);
}`}
      />
      <CodeBlock
        filename="package.json"
        wrapToggle={false}
        startLine={14}
        code={`  "dependencies": {
    "motion": "^12.23.0",
    "next": "16.1.0",
    "react": "^19.3.0"
  },`}
      />
    </div>
  );
}
