import { CodeBlock } from "@/components/ui/code-block";

export default function CodeBlockBare() {
  return (
    <div className="grid w-full max-w-2xl gap-3 text-[15px] leading-relaxed text-white/70">
      <p>Add the component, then import it where your docs render code:</p>
      <CodeBlock
        header={false}
        lineNumbers={false}
        language="bash"
        code="npx shadcn@latest add https://get-neonkit.vercel.app/r/code-block.json"
      />
      <CodeBlock
        header={false}
        lineNumbers={false}
        language="tsx"
        code={`<CodeBlock filename="app/page.tsx" code={source} highlight={[3, 4]} />`}
      />
    </div>
  );
}
