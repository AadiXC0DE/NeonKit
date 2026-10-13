"use client";

import * as React from "react";
import { WrapText } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { CopyButton } from "@/components/ui/copy-button";

/* ------------------------------------------------------------------------------------------------
 * Tokenizer
 *
 * Small hand-rolled scanners for the languages people paste into docs and chat: JS/TS/JSX/TSX,
 * HTML, JSON, CSS and shell. They aim for "reads right" rather than a full grammar, run on the
 * server and the client alike, and output plain [kind, text] pairs.
 * ---------------------------------------------------------------------------------------------- */

export type CodeTokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "type"
  | "property"
  | "punctuation"
  | "tag"
  | "attr"
  | "variable"
  | "prompt";

export type CodeToken = [kind: CodeTokenKind, text: string];

type Family = "script" | "html" | "json" | "css" | "shell" | "text";

const families: Record<string, Family> = {
  js: "script",
  jsx: "script",
  ts: "script",
  tsx: "script",
  mjs: "script",
  cjs: "script",
  mts: "script",
  javascript: "script",
  typescript: "script",
  html: "html",
  xml: "html",
  svg: "html",
  vue: "html",
  json: "json",
  jsonc: "json",
  json5: "json",
  css: "css",
  scss: "css",
  postcss: "css",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  shell: "shell",
  console: "shell",
  terminal: "shell",
};

const languageNames: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  mjs: "JavaScript",
  cjs: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  mts: "TypeScript",
  tsx: "TSX",
  html: "HTML",
  xml: "XML",
  svg: "SVG",
  vue: "Vue",
  json: "JSON",
  jsonc: "JSON",
  json5: "JSON5",
  css: "CSS",
  scss: "SCSS",
  postcss: "CSS",
  sh: "Shell",
  shell: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  console: "Terminal",
  terminal: "Terminal",
  diff: "Diff",
  md: "Markdown",
  markdown: "Markdown",
  py: "Python",
  python: "Python",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  sql: "SQL",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  text: "Plain text",
  txt: "Plain text",
};

const extensionLanguages: Record<string, string> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  mts: "ts",
  json: "json",
  css: "css",
  scss: "scss",
  html: "html",
  svg: "svg",
  sh: "bash",
  bash: "bash",
  zsh: "zsh",
  md: "md",
  py: "py",
  go: "go",
  rs: "rust",
  sql: "sql",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  diff: "diff",
  patch: "diff",
};

function languageFromFilename(filename?: string) {
  const ext = filename?.split(".").pop()?.toLowerCase();
  return ext ? extensionLanguages[ext] : undefined;
}

/** "tsx" → "TSX", "sh" → "Shell". Unknown ids come back unchanged. */
export function languageLabel(language?: string) {
  if (!language) return "";
  return languageNames[language.toLowerCase()] ?? language;
}

class Emitter {
  tokens: CodeToken[] = [];
  push(kind: CodeTokenKind, text: string) {
    if (!text) return;
    const last = this.tokens[this.tokens.length - 1];
    if (last && last[0] === kind) last[1] += text;
    else this.tokens.push([kind, text]);
  }
}

function at(re: RegExp, src: string, index: number) {
  re.lastIndex = index;
  const m = re.exec(src);
  return m ? m[0] : null;
}

/** Index just past a quoted string starting at `start`. Single-line quotes stop at a newline. */
function endOfString(src: string, start: number, multiline: boolean) {
  const quote = src[start];
  let j = start + 1;
  while (j < src.length) {
    const c = src[j];
    if (c === "\\") j += 2;
    else if (c === quote) return j + 1;
    else if (c === "\n" && !multiline) return j;
    else j++;
  }
  return src.length;
}

const WS = /\s+/y;
const IDENT = /[A-Za-z_$À-￿][\w$À-￿]*/y;
const NUMBER = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?)/y;
const OPERATOR = /=>|===|!==|==|!=|<=|>=|&&=|\|\|=|\?\?=|&&|\|\||\?\?|\?\.|\+\+|--|\*\*|\.\.\.|[+\-*/%=&|^!~?:<>.]/y;
const REGEX = /\/(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuyv]*/y;
const GENERIC_CALL = /<[^()\n;={}]*>\(/y;
const TAG_NAME = /[A-Za-z!][\w.:-]*/y;
const ATTR_NAME = /[A-Za-z_@:][\w.:-]*/y;

const KEYWORDS = new Set(
  "abstract as async await break case catch class const continue debugger declare default delete do else enum export extends finally for from function get if implements import in instanceof interface is keyof let namespace new of private protected public readonly return satisfies set static super switch this throw try type typeof var void while with yield".split(
    " ",
  ),
);
const LITERALS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);
const BUILTIN_TYPES = new Set(["string", "number", "boolean", "void", "never", "unknown", "any", "object", "bigint", "symbol"]);
// After these, `<` opens JSX and `/` opens a regex rather than comparing or dividing.
const EXPRESSION_START = new Set([
  "",
  "(",
  ",",
  "=",
  ":",
  "?",
  "[",
  "{",
  "=>",
  "&&",
  "||",
  "??",
  ";",
  "!",
  "return",
  "yield",
  "default",
  "else",
  "case",
  "do",
  "await",
]);

type ScriptContext =
  | { t: "code"; depth: number }
  | { t: "template" }
  | { t: "text" }
  | { t: "tag"; closing: boolean; named: boolean };

function tokenizeScript(src: string, html: boolean): CodeToken[] {
  const out = new Emitter();
  const stack: ScriptContext[] = html ? [{ t: "text" }] : [{ t: "code", depth: 0 }];
  const n = src.length;
  let i = 0;
  let prev = "";

  const significant = (kind: CodeTokenKind, text: string) => {
    out.push(kind, text);
    prev = text;
  };

  while (i < n) {
    const ctx = stack[stack.length - 1];
    const ch = src[i];

    if (ctx.t === "template") {
      if (ch === "`") {
        stack.pop();
        significant("string", ch);
        i++;
      } else if (ch === "$" && src[i + 1] === "{") {
        out.push("punctuation", "${");
        stack.push({ t: "code", depth: 0 });
        prev = "{";
        i += 2;
      } else {
        let j = i;
        while (j < n && src[j] !== "`" && !(src[j] === "$" && src[j + 1] === "{")) j += src[j] === "\\" ? 2 : 1;
        out.push("string", src.slice(i, Math.min(j, n)));
        i = Math.min(j, n);
      }
      continue;
    }

    if (ctx.t === "text") {
      if (ch === "{" && !html) {
        out.push("punctuation", ch);
        stack.push({ t: "code", depth: 0 });
        prev = "{";
        i++;
        continue;
      }
      if (ch === "<") {
        if (src.startsWith("<!--", i)) {
          const end = src.indexOf("-->", i + 4);
          const j = end < 0 ? n : end + 3;
          out.push("comment", src.slice(i, j));
          i = j;
          continue;
        }
        const next = src[i + 1] ?? "";
        if (next === "/") {
          out.push("punctuation", "</");
          stack.push({ t: "tag", closing: true, named: false });
          i += 2;
          continue;
        }
        if (/[A-Za-z>!]/.test(next)) {
          out.push("punctuation", "<");
          stack.push({ t: "tag", closing: false, named: false });
          i++;
          continue;
        }
      }
      let j = i + 1;
      while (j < n && src[j] !== "<" && (html || src[j] !== "{")) j++;
      out.push("plain", src.slice(i, j));
      i = j;
      continue;
    }

    if (ctx.t === "tag") {
      const space = at(WS, src, i);
      if (space) {
        out.push("plain", space);
        i += space.length;
        continue;
      }
      if (!ctx.named) {
        ctx.named = true;
        const name = at(TAG_NAME, src, i);
        if (name) {
          out.push(!html && /^[A-Z]/.test(name) ? "type" : "tag", name);
          i += name.length;
          continue;
        }
      }
      if (ch === "/" && src[i + 1] === ">") {
        out.push("punctuation", "/>");
        stack.pop();
        prev = ")";
        i += 2;
        continue;
      }
      if (ch === ">") {
        out.push("punctuation", ">");
        stack.pop();
        if (!ctx.closing) stack.push({ t: "text" });
        else {
          if (stack.length > 1 && stack[stack.length - 1].t === "text") stack.pop();
          prev = ")";
        }
        i++;
        continue;
      }
      if (ch === "{") {
        out.push("punctuation", ch);
        stack.push({ t: "code", depth: 0 });
        prev = "{";
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        const j = endOfString(src, i, true);
        out.push("string", src.slice(i, j));
        i = j;
        continue;
      }
      const attr = at(ATTR_NAME, src, i);
      if (attr) {
        out.push("attr", attr);
        i += attr.length;
        continue;
      }
      out.push("punctuation", ch);
      i++;
      continue;
    }

    // Plain script.
    const space = at(WS, src, i);
    if (space) {
      out.push("plain", space);
      i += space.length;
      continue;
    }

    if (ch === "/" && src[i + 1] === "/") {
      let j = src.indexOf("\n", i);
      if (j < 0) j = n;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end < 0 ? n : end + 2;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const j = endOfString(src, i, false);
      significant("string", src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === "`") {
      out.push("string", ch);
      stack.push({ t: "template" });
      i++;
      continue;
    }
    if (ch === "/" && EXPRESSION_START.has(prev)) {
      const regex = at(REGEX, src, i);
      if (regex) {
        significant("string", regex);
        i += regex.length;
        continue;
      }
    }
    if (ch === "<" && /[A-Za-z>]/.test(src[i + 1] ?? "") && EXPRESSION_START.has(prev)) {
      out.push("punctuation", "<");
      stack.push({ t: "tag", closing: false, named: false });
      i++;
      continue;
    }

    const number = /[\d.]/.test(ch) ? at(NUMBER, src, i) : null;
    if (number && number !== ".") {
      significant("number", number);
      i += number.length;
      continue;
    }

    const word = at(IDENT, src, i);
    if (word) {
      const after = i + word.length;
      let k = after;
      while (src[k] === " " || src[k] === "\t") k++;
      const next = src[k];
      let kind: CodeTokenKind = "plain";
      if (prev === "." || prev === "?.") {
        kind = next === "(" ? "function" : "property";
      } else if (next === ":" && src[k + 1] !== ":" && (prev === "{" || prev === ",")) {
        kind = "property";
      } else if (KEYWORDS.has(word)) {
        kind = "keyword";
      } else if (LITERALS.has(word)) {
        kind = "number";
      } else if (next === "(" || (next === "<" && at(GENERIC_CALL, src, k))) {
        kind = "function";
      } else if (/^[A-Z]/.test(word)) {
        kind = "type";
      } else if (BUILTIN_TYPES.has(word) && [":", "<", "|", "&", ","].includes(prev)) {
        kind = "type";
      }
      significant(kind, word);
      i = after;
      continue;
    }

    if (ch === "{" || ch === "(" || ch === "[") {
      if (ch === "{" && ctx.t === "code") ctx.depth++;
      significant("punctuation", ch);
      i++;
      continue;
    }
    if (ch === "}") {
      if (ctx.t === "code" && ctx.depth > 0) ctx.depth--;
      else if (stack.length > 1) stack.pop();
      significant("punctuation", ch);
      i++;
      continue;
    }
    if (ch === ")" || ch === "]" || ch === ";" || ch === ",") {
      significant("punctuation", ch);
      i++;
      continue;
    }

    const op = at(OPERATOR, src, i);
    if (op) {
      significant("punctuation", op);
      i += op.length;
      continue;
    }

    out.push("plain", ch);
    i++;
  }

  return out.tokens;
}

function tokenizeJson(src: string): CodeToken[] {
  const out = new Emitter();
  const n = src.length;
  let i = 0;
  while (i < n) {
    const ch = src[i];
    const space = at(WS, src, i);
    if (space) {
      out.push("plain", space);
      i += space.length;
      continue;
    }
    if (ch === "/" && (src[i + 1] === "/" || src[i + 1] === "*")) {
      const line = src[i + 1] === "/";
      const end = line ? src.indexOf("\n", i) : src.indexOf("*/", i + 2);
      const j = end < 0 ? n : line ? end : end + 2;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const j = endOfString(src, i, false);
      let k = j;
      while (/\s/.test(src[k] ?? "")) k++;
      out.push(src[k] === ":" ? "property" : "string", src.slice(i, j));
      i = j;
      continue;
    }
    const number = at(/-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y, src, i);
    if (number) {
      out.push("number", number);
      i += number.length;
      continue;
    }
    const word = at(/[A-Za-z_$][\w$]*/y, src, i);
    if (word) {
      out.push(LITERALS.has(word) ? "number" : "plain", word);
      i += word.length;
      continue;
    }
    out.push("punctuation", ch);
    i++;
  }
  return out.tokens;
}

function tokenizeCss(src: string): CodeToken[] {
  const out = new Emitter();
  const n = src.length;
  let i = 0;
  let mode: "statement" | "selector" | "property" | "value" = "statement";

  while (i < n) {
    const ch = src[i];
    const space = at(WS, src, i);
    if (space) {
      out.push("plain", space);
      i += space.length;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end < 0 ? n : end + 2;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }

    if (mode === "statement") {
      if (ch === "}") {
        out.push("punctuation", ch);
        i++;
        continue;
      }
      if (ch === "@") {
        const rule = at(/@[\w-]+/y, src, i) ?? "@";
        out.push("keyword", rule);
        i += rule.length;
        mode = "value";
        continue;
      }
      // Look ahead: a `{` before the next `;` or `}` means this is a selector.
      let j = i;
      let depth = 0;
      while (j < n) {
        const c = src[j];
        if (c === '"' || c === "'") j = endOfString(src, j, false);
        else {
          if (c === "(") depth++;
          else if (c === ")") depth--;
          else if (depth <= 0 && (c === "{" || c === ";" || c === "}")) break;
          j++;
        }
      }
      mode = src[j] === "{" ? "selector" : "property";
      continue;
    }

    if (mode === "selector") {
      if (ch === "{") {
        out.push("punctuation", ch);
        mode = "statement";
        i++;
        continue;
      }
      const pseudo = at(/::?[\w-]+/y, src, i);
      if (pseudo) {
        out.push("keyword", pseudo);
        i += pseudo.length;
        continue;
      }
      if (ch === "[") {
        const end = src.indexOf("]", i);
        const j = end < 0 ? n : end + 1;
        out.push("attr", src.slice(i, j));
        i = j;
        continue;
      }
      const name = at(/[.#]?-?[A-Za-z_][\w-]*|\*|&/y, src, i);
      if (name) {
        out.push("tag", name);
        i += name.length;
        continue;
      }
      out.push("punctuation", ch);
      i++;
      continue;
    }

    if (mode === "property") {
      if (ch === ":") {
        out.push("punctuation", ch);
        mode = "value";
        i++;
        continue;
      }
      if (ch === ";" || ch === "}") {
        out.push("punctuation", ch);
        mode = "statement";
        i++;
        continue;
      }
      const name = at(/--[\w-]+|-?[A-Za-z_][\w-]*/y, src, i);
      if (name) {
        out.push(name.startsWith("--") ? "variable" : "property", name);
        i += name.length;
        continue;
      }
      out.push("punctuation", ch);
      i++;
      continue;
    }

    // Values and at-rule preludes.
    if (ch === ";" || ch === "{" || ch === "}") {
      out.push("punctuation", ch);
      mode = "statement";
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const j = endOfString(src, i, false);
      out.push("string", src.slice(i, j));
      i = j;
      continue;
    }
    const hex = at(/#[\da-fA-F]{3,8}(?![\w-])/y, src, i);
    if (hex) {
      out.push("number", hex);
      i += hex.length;
      continue;
    }
    const number = at(/-?(?:\d+\.?\d*|\.\d+)(?:%|[A-Za-z]+)?/y, src, i);
    if (number) {
      out.push("number", number);
      i += number.length;
      continue;
    }
    const important = at(/!important/y, src, i);
    if (important) {
      out.push("keyword", important);
      i += important.length;
      continue;
    }
    const word = at(/--[\w-]+|-?[A-Za-z_][\w-]*/y, src, i);
    if (word) {
      out.push(word.startsWith("--") ? "variable" : src[i + word.length] === "(" ? "function" : "plain", word);
      i += word.length;
      continue;
    }
    out.push("punctuation", ch);
    i++;
  }
  return out.tokens;
}

const SHELL_KEYWORDS = new Set(
  "if then else elif fi for while until do done case esac in function return export local readonly unset select time".split(" "),
);
// After these words the next word is a command again.
const SHELL_PREFIXES = new Set(["sudo", "then", "else", "do", "time", "exec", "xargs", "!"]);

function tokenizeShell(src: string): CodeToken[] {
  const out = new Emitter();
  const n = src.length;
  let i = 0;
  let command = true;
  let lineStart = true;

  while (i < n) {
    const ch = src[i];

    if (lineStart) {
      lineStart = false;
      command = true;
      const prompt = at(/[ \t]*(?:\$|❯|>)(?= )/y, src, i);
      if (prompt) {
        out.push("prompt", prompt);
        i += prompt.length;
        continue;
      }
    }
    if (ch === "\n") {
      out.push("plain", ch);
      i++;
      lineStart = true;
      continue;
    }
    const space = at(/[ \t]+/y, src, i);
    if (space) {
      out.push("plain", space);
      i += space.length;
      continue;
    }
    if (ch === "#") {
      let j = src.indexOf("\n", i);
      if (j < 0) j = n;
      out.push("comment", src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const j = endOfString(src, i, true);
      out.push("string", src.slice(i, j));
      i = j;
      command = false;
      continue;
    }
    const variable = at(/\$(?:\{[^}\n]*\}|[A-Za-z_]\w*|[\d@*#?$!-])/y, src, i);
    if (variable) {
      out.push("variable", variable);
      i += variable.length;
      continue;
    }
    if (ch === "$" && src[i + 1] === "(") {
      out.push("punctuation", "$(");
      i += 2;
      command = true;
      continue;
    }
    const op = at(/&&|\|\||;;|>>|[|;&<>()]/y, src, i);
    if (op) {
      out.push("punctuation", op);
      i += op.length;
      if (op !== ">" && op !== ">>" && op !== "<" && op !== ")") command = true;
      continue;
    }
    // A backslash escapes the next character; before a newline it continues the command.
    if (ch === "\\") {
      out.push("punctuation", src.slice(i, i + 2));
      i += 2;
      continue;
    }
    if (command) {
      const assign = at(/[A-Za-z_]\w*(?==)/y, src, i);
      if (assign) {
        out.push("variable", assign);
        out.push("punctuation", "=");
        i += assign.length + 1;
        const value = at(/[^\s;|&]*/y, src, i) ?? "";
        out.push("string", value);
        i += value.length;
        continue;
      }
    }
    const word = at(/[^\s;|&<>()'"$\\]+/y, src, i);
    if (word) {
      if (/^-/.test(word) && !command) out.push("attr", word);
      else if (SHELL_KEYWORDS.has(word)) {
        out.push("keyword", word);
        command = SHELL_PREFIXES.has(word);
      } else if (command) {
        out.push("function", word);
        command = SHELL_PREFIXES.has(word);
      } else out.push("plain", word);
      i += word.length;
      continue;
    }
    out.push("plain", ch);
    i++;
  }
  return out.tokens;
}

/** Splits code into colored tokens. Unknown languages come back as one plain token. */
export function tokenize(code: string, language?: string): CodeToken[] {
  const family = families[(language ?? "").toLowerCase()] ?? "text";
  switch (family) {
    case "script":
      return tokenizeScript(code, false);
    case "html":
      return tokenizeScript(code, true);
    case "json":
      return tokenizeJson(code);
    case "css":
      return tokenizeCss(code);
    case "shell":
      return tokenizeShell(code);
    default:
      return code ? [["plain", code]] : [];
  }
}

function splitLines(tokens: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];
  for (const [kind, text] of tokens) {
    const parts = text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push([kind, part]);
    });
  }
  return lines;
}

/* ------------------------------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------------------------- */

// Token colors live in CSS so they can derive from --neon with relative color syntax. Each rule
// is written twice: browsers without `oklch(from …)` keep the color-mix line before it.
const css = `
.nk-code{--nk-code-fg:#c9d1de;--nk-code-dim:#7d8698;--nk-code-comment:#788196;--nk-code-bright:#eef2f8;
--nk-code-keyword:color-mix(in oklab,rgb(var(--neon)) 74%,white);
--nk-code-string:color-mix(in oklab,rgb(var(--neon)) 34%,#e8edf5);
--nk-code-number:color-mix(in oklab,rgb(var(--neon)) 52%,#e8edf5);
--nk-code-type:color-mix(in oklab,rgb(var(--neon)) 22%,#eef2f8)}
@supports (color:oklch(from red l c h)){.nk-code{
--nk-code-string:oklch(from rgb(var(--neon)) 0.85 0.075 calc(h - 52));
--nk-code-number:oklch(from rgb(var(--neon)) 0.83 0.095 calc(h + 72));
--nk-code-type:oklch(from rgb(var(--neon)) 0.91 0.045 h)}}
.nk-code-line{color:var(--nk-code-fg)}
.nk-t-keyword{color:var(--nk-code-keyword)}
.nk-t-string{color:var(--nk-code-string)}
.nk-t-number{color:var(--nk-code-number)}
.nk-t-comment{color:var(--nk-code-comment);font-style:italic}
.nk-t-function,.nk-t-tag{color:var(--nk-code-bright)}
.nk-t-type,.nk-t-variable{color:var(--nk-code-type)}
.nk-t-property,.nk-t-attr{color:#a7b1c3}
.nk-t-punctuation{color:var(--nk-code-dim)}
.nk-t-prompt{color:color-mix(in oklab,rgb(var(--neon)) 55%,#5a6276);user-select:none}
.nk-code-row[data-diff=add]{background:linear-gradient(90deg,rgb(52 211 153/0.11),rgb(52 211 153/0.05))}
.nk-code-row[data-diff=remove]{background:linear-gradient(90deg,rgb(255 77 94/0.11),rgb(255 77 94/0.05))}
.nk-code-row[data-diff=remove] .nk-code-line{opacity:.72}
.nk-code-row[data-highlight]{background:linear-gradient(90deg,rgb(var(--neon)/0.16),rgb(var(--neon)/0.06) 32%,rgb(var(--neon)/0.035))}
.nk-code-gutter{background:#0a0c12}
.nk-code-row[data-diff=add] .nk-code-gutter{background:color-mix(in srgb,rgb(52 211 153) 10%,#0a0c12)}
.nk-code-row[data-diff=remove] .nk-code-gutter{background:color-mix(in srgb,rgb(255 77 94) 10%,#0a0c12)}
.nk-code-row[data-highlight] .nk-code-gutter{background:color-mix(in srgb,rgb(var(--neon)) 12%,#0a0c12)}
.nk-code-scroll{scrollbar-width:thin;scrollbar-color:rgb(255 255 255/0.14) transparent}
`;

export type CodeLineSpec = number | [from: number, to: number];

function toLineSet(spec?: CodeLineSpec[]) {
  const set = new Set<number>();
  for (const item of spec ?? []) {
    if (Array.isArray(item)) for (let line = item[0]; line <= item[1]; line++) set.add(line);
    else set.add(item);
  }
  return set;
}

type DiffKind = "add" | "remove" | undefined;

function parseDiff(code: string) {
  const kinds: DiffKind[] = [];
  const stripped = code.split("\n").map((line) => {
    const mark = line[0];
    if (mark === "+") kinds.push("add");
    else if (mark === "-") kinds.push("remove");
    else kinds.push(undefined);
    return mark === "+" || mark === "-" || mark === " " ? line.slice(1) : line;
  });
  return { code: stripped.join("\n"), kinds };
}

/** The file as it reads after the diff: context and added lines, markers stripped. */
function codeAfterDiff(code: string) {
  return code
    .split("\n")
    .filter((line) => line[0] !== "-")
    .map((line) => (line[0] === "+" || line[0] === " " ? line.slice(1) : line))
    .join("\n");
}

function trimTrailingNewline(code: string) {
  return code.endsWith("\n") ? code.slice(0, -1) : code;
}

export interface CodeBlockFile {
  /** Shown on the tab and used as its value. */
  filename: string;
  code: string;
  /** Defaults to the file extension. */
  language?: string;
  highlight?: CodeLineSpec[];
  diff?: boolean;
  startLine?: number;
}

interface CodeBodyProps {
  code: string;
  language?: string;
  lineNumbers: boolean;
  highlight?: CodeLineSpec[];
  diff: boolean;
  wrap: boolean;
  startLine: number;
}

const CodeBody = React.memo(function CodeBody({
  code,
  language,
  lineNumbers,
  highlight,
  diff,
  wrap,
  startLine,
}: CodeBodyProps) {
  const highlightKey = JSON.stringify(highlight ?? []);
  const { lines, kinds } = React.useMemo(() => {
    const source = trimTrailingNewline(code);
    const parsed = diff ? parseDiff(source) : { code: source, kinds: [] as DiffKind[] };
    const lang = language === "diff" ? undefined : language;
    return { lines: splitLines(tokenize(parsed.code, lang)), kinds: parsed.kinds };
  }, [code, language, diff]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lit = React.useMemo(() => toLineSet(highlight), [highlightKey]);
  const digits = String(startLine + lines.length - 1).length;
  const showGutter = lineNumbers || diff || lit.size > 0;

  return (
    <div className={cn("grid py-3", wrap ? "w-full" : "w-max min-w-full")}>
      {lines.map((tokens, index) => {
        const number = startLine + index;
        const isLit = lit.has(number);
        const kind = kinds[index];
        // Neighbouring lit lines share one tube; only the ends are capped.
        const litAbove = lit.has(number - 1);
        const litBelow = lit.has(number + 1);
        return (
          <div
            key={index}
            className="nk-code-row relative flex min-h-[1.7em]"
            data-highlight={isLit || undefined}
            data-diff={kind}
          >
            {showGutter && (
              <span
                aria-hidden
                className={cn(
                  "nk-code-gutter sticky left-0 z-[1] flex shrink-0 select-none items-start justify-end gap-2 pl-4 pr-3",
                )}
              >
                {isLit && (
                  <span
                    className={cn(
                      "absolute left-[7px] w-[2px] rounded-full",
                      "[background:color-mix(in_srgb,rgb(var(--neon))_55%,white)]",
                      "shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.8),0_0_28px_rgb(var(--neon)/0.45)]",
                      litAbove ? "top-0" : "top-[5px]",
                      litBelow ? "bottom-0" : "bottom-[5px]",
                    )}
                  />
                )}
                {lineNumbers && (
                  <span
                    style={{ minWidth: `${digits}ch` }}
                    className={cn(
                      "text-right tabular-nums transition-colors",
                      isLit
                        ? "[color:color-mix(in_srgb,rgb(var(--neon))_70%,white)] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]"
                        : "text-white/[0.28]",
                    )}
                  >
                    {number}
                  </span>
                )}
                {diff && (
                  <span
                    className={cn(
                      "w-[1ch] text-center",
                      kind === "add" && "text-[rgb(52_211_153)]",
                      kind === "remove" && "text-[rgb(255_77_94)]",
                    )}
                  >
                    {kind === "add" ? "+" : kind === "remove" ? "−" : ""}
                  </span>
                )}
              </span>
            )}
            <span
              className={cn(
                "nk-code-line block min-w-0 flex-1 pr-5",
                !showGutter && "pl-4",
                wrap ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "whitespace-pre",
              )}
            >
              {kind && (
                <span className="sr-only select-none">{kind === "add" ? "Added: " : "Removed: "}</span>
              )}
              {tokens.map(([tokenKind, text], t) =>
                tokenKind === "plain" ? (
                  <React.Fragment key={t}>{text}</React.Fragment>
                ) : (
                  <span key={t} className={`nk-t-${tokenKind}`}>
                    {text}
                  </span>
                ),
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
});

function Filename({ name }: { name: string }) {
  const slash = name.lastIndexOf("/");
  return (
    <span className="min-w-0 truncate font-mono text-[12.5px]">
      {slash >= 0 && <span className="text-white/50">{name.slice(0, slash + 1)}</span>}
      <span className="text-white/85">{name.slice(slash + 1)}</span>
    </span>
  );
}

const iconButton = cn(
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/55 outline-none",
  "transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-white/[0.06] hover:text-white/90",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c12]",
  "[&_svg]:size-3.5",
);

export interface CodeBlockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** The source. Ignored when `files` is set. */
  code?: string;
  /** `tsx`, `ts`, `js`, `json`, `css`, `bash`, `html`… Defaults to the filename's extension. */
  language?: string;
  /** Shown in the header. Directories are dimmed. */
  filename?: string;
  /** Several files behind tabs. The tab value is the filename. */
  files?: CodeBlockFile[];
  /** Controlled active file (tabs). */
  value?: string;
  /** Initial active file when uncontrolled. Defaults to the first. */
  defaultValue?: string;
  onValueChange?: (filename: string) => void;
  /** Line numbers to light, e.g. `[3, 4]` or `[[3, 6]]` for a range. */
  highlight?: CodeLineSpec[];
  /** Read a leading `+` / `-` on each line as added / removed. */
  diff?: boolean;
  lineNumbers?: boolean;
  /** First line number, for excerpts. */
  startLine?: number;
  /** Controlled word wrap. */
  wrap?: boolean;
  defaultWrap?: boolean;
  onWrapChange?: (wrap: boolean) => void;
  /** Show the wrap toggle in the header. */
  wrapToggle?: boolean;
  /** Show the copy button. */
  copyable?: boolean;
  /** Scrolls past this height. Numbers are pixels. */
  maxHeight?: number | string;
  /** Hide the header bar. Copy floats in the corner instead. */
  header?: boolean;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      className,
      style,
      color,
      code = "",
      language: languageProp,
      filename,
      files,
      value: valueProp,
      defaultValue,
      onValueChange,
      highlight,
      diff = false,
      lineNumbers = true,
      startLine = 1,
      wrap: wrapProp,
      defaultWrap = false,
      onWrapChange,
      wrapToggle = true,
      copyable = true,
      maxHeight,
      header = true,
      ...props
    },
    ref,
  ) => {
    const baseId = React.useId();
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const hasTabs = !!files && files.length > 0;

    const [innerValue, setInnerValue] = React.useState(defaultValue ?? files?.[0]?.filename);
    const value = valueProp ?? innerValue;
    const activeIndex = hasTabs ? Math.max(0, files.findIndex((file) => file.filename === value)) : 0;
    const active = hasTabs ? files[activeIndex] : undefined;

    const [innerWrap, setInnerWrap] = React.useState(defaultWrap);
    const wrap = wrapProp ?? innerWrap;
    const setWrap = (next: boolean) => {
      if (wrapProp === undefined) setInnerWrap(next);
      onWrapChange?.(next);
    };

    const select = (filename: string) => {
      if (valueProp === undefined) setInnerValue(filename);
      onValueChange?.(filename);
    };

    const current = {
      code: active?.code ?? code,
      filename: active?.filename ?? filename,
      language: active?.language ?? (hasTabs ? undefined : languageProp) ?? languageFromFilename(active?.filename ?? filename),
      highlight: active?.highlight ?? (hasTabs ? undefined : highlight),
      diff: active?.diff ?? (hasTabs ? false : diff),
      startLine: active?.startLine ?? (hasTabs ? 1 : startLine),
    };
    const label = languageLabel(current.language);
    const copyValue = () => (current.diff ? codeAfterDiff(current.code) : trimTrailingNewline(current.code));
    const panelId = `${baseId}-panel`;

    const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!files) return;
      const last = files.length - 1;
      const target = {
        ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
        ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(files[target].filename);
      tabRefs.current[target]?.focus();
    };

    const controls = (
      <div className="flex shrink-0 items-center gap-1">
        {header && label && (current.filename || hasTabs) && (
          <span className="mr-1.5 hidden text-xs text-white/50 sm:inline">{label}</span>
        )}
        {wrapToggle && (
          <button
            type="button"
            aria-label="Wrap lines"
            aria-pressed={wrap}
            onClick={() => setWrap(!wrap)}
            className={cn(
              iconButton,
              wrap &&
                "bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/0.6))] hover:bg-[rgb(var(--neon)/0.14)] hover:text-[rgb(var(--neon))]",
            )}
          >
            <WrapText aria-hidden />
          </button>
        )}
        {copyable && (
          <CopyButton
            value={copyValue}
            size="sm"
            aria-label={current.filename ? `Copy ${current.filename}` : "Copy code"}
            className="size-7 [&>span]:size-3.5"
          />
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "nk-code group/code relative grid min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0c12] text-left",
          className,
        )}
        {...props}
      >
        <style href="nk-code-block" precedence="nk">{css}</style>
        {header ? (
          <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] pl-1.5 pr-1.5">
            {hasTabs ? (
              <div
                role="tablist"
                aria-label="Files"
                className="-mb-px flex min-w-0 items-stretch self-stretch overflow-x-auto [scrollbar-width:none]"
              >
                {files.map((file, index) => {
                  const selected = index === activeIndex;
                  return (
                    <button
                      key={file.filename}
                      ref={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      type="button"
                      role="tab"
                      id={`${baseId}-tab-${index}`}
                      aria-selected={selected}
                      aria-controls={panelId}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(file.filename)}
                      onKeyDown={onTabKeyDown}
                      className={cn(
                        "relative flex shrink-0 cursor-pointer items-center whitespace-nowrap px-2.5 font-mono text-[12.5px] outline-none transition-colors duration-150",
                        "focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]",
                        selected ? "text-white/90" : "text-white/50 hover:text-white/80",
                      )}
                    >
                      {file.filename.split("/").pop()}
                      {selected && (
                        <span
                          aria-hidden
                          className="absolute inset-x-2.5 bottom-0 h-[2px] rounded-full [background:color-mix(in_srgb,rgb(var(--neon))_60%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.6)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-w-0 items-center pl-1.5">
                {current.filename ? (
                  <Filename name={current.filename} />
                ) : (
                  <span className="text-xs text-white/55">{label || "Code"}</span>
                )}
              </div>
            )}
            {controls}
          </div>
        ) : (
          copyable && (
            <div className="absolute right-2 top-2 z-[2] opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover/code:opacity-100 [@media(hover:none)]:opacity-100">
              <CopyButton
                value={copyValue}
                size="sm"
                aria-label="Copy code"
                className="size-7 bg-[#0a0c12]/90 [&>span]:size-3.5"
              />
            </div>
          )
        )}
        <div
          id={panelId}
          role={hasTabs ? "tabpanel" : "region"}
          aria-labelledby={hasTabs ? `${baseId}-tab-${activeIndex}` : undefined}
          aria-label={hasTabs ? undefined : current.filename ?? (label ? `${label} code` : "Code")}
          tabIndex={0}
          style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
          className={cn(
            "nk-code-scroll relative overflow-auto font-mono text-[13px] leading-[1.7] outline-none [tab-size:2]",
            "selection:bg-[rgb(var(--neon)/0.28)] [&_*::selection]:bg-[rgb(var(--neon)/0.28)]",
            "focus-visible:shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.55)]",
          )}
        >
          <CodeBody
            code={current.code}
            language={current.language}
            lineNumbers={lineNumbers}
            highlight={current.highlight}
            diff={current.diff || current.language === "diff"}
            wrap={wrap}
            startLine={current.startLine}
          />
        </div>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
