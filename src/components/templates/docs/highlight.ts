// A deliberately tiny highlighter for the four languages these docs use.
// Swap it for Shiki or similar when you move to MDX; CodeBlock only needs tokens back.

export type Lang = "sh" | "toml" | "yaml" | "text";

export type TokenKind = "plain" | "prompt" | "command" | "flag" | "string" | "comment" | "key" | "section" | "value" | "punct" | "output";

export type Token = { kind: TokenKind; text: string };

const STRING = /^("(?:[^"\\]|\\.)*"|'[^']*')/;

function shellLine(line: string, isOutput: boolean, isContinuation: boolean): Token[] {
  if (/^\s*#/.test(line)) return [{ kind: "comment", text: line }];
  if (isOutput) return [{ kind: "output", text: line }];

  const tokens: Token[] = [];
  let rest = line;
  const prompt = rest.match(/^\$ /);
  if (prompt) {
    tokens.push({ kind: "prompt", text: "$ " });
    rest = rest.slice(2);
  }
  let first = !isContinuation;
  while (rest.length) {
    const space = rest.match(/^\s+/);
    if (space) {
      tokens.push({ kind: "plain", text: space[0] });
      rest = rest.slice(space[0].length);
      continue;
    }
    const comment = rest.match(/^#.*/);
    if (comment) {
      tokens.push({ kind: "comment", text: comment[0] });
      break;
    }
    const string = rest.match(STRING);
    if (string) {
      tokens.push({ kind: "string", text: string[0] });
      rest = rest.slice(string[0].length);
      continue;
    }
    const word = rest.match(/^[^\s"']+/);
    const text = word ? word[0] : rest[0];
    const kind: TokenKind = first ? "command" : /^--?[a-zA-Z]/.test(text) ? "flag" : /^[|&;\\>]+$/.test(text) ? "punct" : "plain";
    tokens.push({ kind, text });
    // The word after a pipe or && is a new command.
    first = kind === "punct" && text !== "\\";
    rest = rest.slice(text.length);
  }
  return tokens;
}

function tomlLine(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ kind: "comment", text: line }];
  const section = line.match(/^(\s*)(\[\[?[^\]]+\]\]?)(.*)$/);
  if (section) {
    return [
      { kind: "plain", text: section[1] },
      { kind: "section", text: section[2] },
      ...(section[3] ? [{ kind: "comment" as const, text: section[3] }] : []),
    ];
  }
  const pair = line.match(/^(\s*)([\w.-]+)(\s*=\s*)(.*)$/);
  if (!pair) return [{ kind: "plain", text: line }];
  const [, indent, key, equals, value] = pair;
  const comment = value.match(/^(.*?)(\s+#.*)$/);
  return [
    { kind: "plain", text: indent },
    { kind: "key", text: key },
    { kind: "punct", text: equals },
    { kind: "value", text: comment ? comment[1] : value },
    ...(comment ? [{ kind: "comment" as const, text: comment[2] }] : []),
  ];
}

function yamlLine(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ kind: "comment", text: line }];
  const pair = line.match(/^(\s*-?\s*)([\w.-]+)(:)(.*)$/);
  if (!pair) {
    const item = line.match(/^(\s*-\s)(.*)$/);
    return item
      ? [
          { kind: "punct", text: item[1] },
          { kind: "value", text: item[2] },
        ]
      : [{ kind: "plain", text: line }];
  }
  const [, lead, key, colon, value] = pair;
  return [
    { kind: "punct", text: lead },
    { kind: "key", text: key },
    { kind: "punct", text: colon },
    { kind: "value", text: value },
  ];
}

export function highlight(code: string, lang: Lang): Token[][] {
  const lines = code.replace(/\n$/, "").split("\n");
  if (lang === "text") return lines.map((line) => [{ kind: "output", text: line }]);
  if (lang === "toml") return lines.map(tomlLine);
  if (lang === "yaml") return lines.map(yamlLine);
  // In a shell block with prompts, lines without one are the program's output.
  const prompted = lines.some((line) => line.startsWith("$ "));
  let continued = false;
  return lines.map((line) => {
    const isContinuation = continued;
    const isOutput = prompted && !line.startsWith("$ ") && !isContinuation && !/^\s*#/.test(line);
    continued = !isOutput && line.trimEnd().endsWith("\\");
    return shellLine(line, isOutput, isContinuation);
  });
}

/** What the copy button copies: commands only, without prompts or output. */
export function copyText(code: string, lang: Lang) {
  if (lang !== "sh") return code.replace(/\n$/, "");
  const lines = code.replace(/\n$/, "").split("\n");
  if (!lines.some((line) => line.startsWith("$ "))) return lines.join("\n");
  const out: string[] = [];
  let continued = false;
  for (const line of lines) {
    if (line.startsWith("$ ")) out.push(line.slice(2));
    else if (continued) out.push(line);
    continued = (line.startsWith("$ ") || continued) && line.trimEnd().endsWith("\\");
  }
  return out.join("\n");
}
