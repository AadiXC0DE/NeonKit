import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createHighlighter, type Highlighter, type ThemeRegistration } from "shiki";

const theme: ThemeRegistration = {
  name: "neonkit",
  type: "dark",
  colors: {
    "editor.background": "#00000000",
    "editor.foreground": "#c8d0de",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#4f586b", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.new", "keyword.operator.expression"], settings: { foreground: "#f58ac6" } },
    { scope: ["string", "string.template", "punctuation.definition.string"], settings: { foreground: "#7ee8f8" } },
    { scope: ["constant.numeric", "constant.language", "constant.language.boolean"], settings: { foreground: "#fbbf24" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"], settings: { foreground: "#e9edf5" } },
    { scope: ["entity.name.tag", "support.class.component", "entity.name.tag.tsx"], settings: { foreground: "#e9edf5" } },
    { scope: ["entity.other.attribute-name", "entity.other.attribute-name.tsx"], settings: { foreground: "#b8a6fb" } },
    { scope: ["entity.name.type", "support.type", "entity.name.type.alias", "support.type.primitive"], settings: { foreground: "#8fb8ff" } },
    { scope: ["variable", "variable.other", "meta.object-literal.key"], settings: { foreground: "#c8d0de" } },
    { scope: ["variable.parameter"], settings: { foreground: "#d6dcea" } },
    { scope: ["punctuation", "meta.brace", "punctuation.separator", "punctuation.terminator", "keyword.operator"], settings: { foreground: "#6b7489" } },
    { scope: ["punctuation.definition.tag"], settings: { foreground: "#5a6276" } },
    { scope: ["source.shell", "support.function.builtin.shell"], settings: { foreground: "#c8d0de" } },
  ],
};

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [theme],
    langs: ["tsx", "ts", "bash", "css", "json"],
  });
  return highlighter;
}

export type Lang = "tsx" | "ts" | "bash" | "css" | "json";

export async function highlight(code: string, lang: Lang = "tsx") {
  const shiki = await getHighlighter();
  return shiki.codeToHtml(code.trimEnd(), { lang, theme: "neonkit" });
}

// Only runs while pages are prerendered, so keep the bundler from tracing the repo.
export async function readSource(relativePath: string) {
  return fs.readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath), "utf8");
}
