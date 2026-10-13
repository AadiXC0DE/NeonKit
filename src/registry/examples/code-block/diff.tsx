import { CodeBlock } from "@/components/ui/code-block";

const code = `-const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => (
-  <input ref={ref} className="h-10 rounded-lg px-3" {...props} />
-));
-Input.displayName = "Input";
+function Input({ ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
+  return <input ref={ref} className="h-10 rounded-lg px-3" {...props} />;
+}
 
 export { Input };`;

export default function CodeBlockDiff() {
  return <CodeBlock filename="components/input.tsx" code={code} diff highlight={[5]} className="w-full max-w-2xl" />;
}
