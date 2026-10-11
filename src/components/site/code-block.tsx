import { highlight, type Lang } from "@/lib/highlight";
import { CodeFrame } from "./code-frame";

export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
  maxHeight,
}: {
  code: string;
  lang?: Lang;
  title?: string;
  className?: string;
  maxHeight?: number;
}) {
  const html = await highlight(code, lang);
  return <CodeFrame html={html} code={code} title={title} className={className} maxHeight={maxHeight} />;
}
