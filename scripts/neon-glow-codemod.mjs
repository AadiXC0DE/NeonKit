#!/usr/bin/env node
/**
 * Puts every glow in the library behind one multiplier, `--neon-glow` (unitless, default 1).
 *
 * A glow is light that spills past an element: a blurred box-shadow, text-shadow or
 * drop-shadow layer in a non-dark color, or a radial-gradient stop in a neon variable.
 * Its alpha becomes `alpha * var(--neon-glow, 1)`:
 *
 *   shadow-[0_0_18px_rgb(var(--neon)/0.45)]
 *   shadow-[0_0_18px_rgb(var(--neon)/calc(0.45*var(--neon-glow,1)))]
 *
 * Fills, borders, text colors, focus rings and zero-blur rings are structure, not glow,
 * and stay put. Dark depth shadows stay put. Canvas, SVG filter and blurred-copy glows
 * can't be rewritten as text; they're listed for hand work.
 *
 *   node scripts/neon-glow-codemod.mjs                 dry run over src/components/ui
 *   node scripts/neon-glow-codemod.mjs --write         rewrite in place
 *   node scripts/neon-glow-codemod.mjs --out <dir>     write rewritten copies to <dir>
 *   node scripts/neon-glow-codemod.mjs --check         exit 1 if un-tokened glow remains
 *   node scripts/neon-glow-codemod.mjs --report <file> also write the dry-run report as markdown
 *   node scripts/neon-glow-codemod.mjs [dir or files…] other targets
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const GLOW_VAR = "--neon-glow";

// ── Value scanning ─────────────────────────────────────────────────────────

/**
 * Splits `text` at depth-0 characters matching `isSep`, keeping parens, brackets,
 * quotes and `${…}` interpolations whole. Returns `{ text, start }` pieces.
 */
function splitTop(text, isSep) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "$" && text[i + 1] === "{") {
      i = skipInterpolation(text, i);
      continue;
    }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && isSep(c)) {
      parts.push({ text: text.slice(start, i), start });
      start = i + 1;
    }
  }
  parts.push({ text: text.slice(start), start });
  return parts;
}

/** Index of the `}` closing the `${` at `i`. */
function skipInterpolation(text, i) {
  let depth = 0;
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === "{") depth++;
    else if (text[j] === "}" && --depth === 0) return j;
  }
  return text.length - 1;
}

/** Index just past the bracket or paren that closes the one at `open`. */
function closeOf(text, open) {
  const pairs = { "(": ")", "[": "]" };
  const stack = [];
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === "$" && text[i + 1] === "{") {
      i = skipInterpolation(text, i);
      continue;
    }
    if (c in pairs) stack.push(pairs[c]);
    else if (c === ")" || c === "]") {
      if (stack.pop() !== c) return -1;
      if (stack.length === 0) return i + 1;
    }
  }
  return -1;
}

const LENGTH = /^-?(\d*\.)?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cqw|cqh|cqi)?$/i;
const MATH = /^(calc|min|max|clamp)\(/i;
const COLOR_FN = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;
const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const NAMED = /^(white|black|transparent|currentcolor)$/i;

const isInterpolation = (t) => /^\$\{[\s\S]*\}$/.test(t);
const isLength = (t) => LENGTH.test(t) || MATH.test(t);
const isColor = (t) => COLOR_FN.test(t) || HEX.test(t) || NAMED.test(t);
const isZero = (t) => /^-?0*\.?0+(px|em|rem|%)?$/i.test(t);

/** Channels of a literal color, or null when it depends on a variable. */
function literalRgba(color) {
  const c = color.trim();
  if (HEX.test(c)) {
    let h = c.slice(1);
    if (h.length <= 4) h = h.replace(/./g, (x) => x + x);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  if (/^white$/i.test(c)) return { r: 255, g: 255, b: 255, a: 1 };
  if (/^black$/i.test(c)) return { r: 0, g: 0, b: 0, a: 1 };
  if (/^transparent$/i.test(c)) return { r: 0, g: 0, b: 0, a: 0 };
  const m = /^rgba?\(\s*([\d.]+)[\s,_]+([\d.]+)[\s,_]+([\d.]+)\s*(?:[,/_]\s*_?\/?_?\s*([\d.]+%?))?\s*\)$/i.exec(c);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  return null;
}

/**
 * Depth shadows (dark colors) and faint neutral sheens aren't light. Everything
 * else with blur is: neon variables, saturated colors, white tube cores.
 */
function isGlowColor(color) {
  if (/^transparent$/i.test(color)) return false;
  const rgba = literalRgba(color.replace(/_/g, " "));
  if (!rgba) {
    const hsl = /^hsla?\(\s*[\d.]+(deg)?[\s,_]+([\d.]+)%[\s,_]+([\d.]+)%/i.exec(color);
    if (hsl) return +hsl[3] > 18;
    return true;
  }
  const { r, g, b, a } = rgba;
  if (a === 0) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max <= 48) return false;
  const neutral = max - min < 24;
  if (neutral) return max >= 200 && a >= 0.25;
  return true;
}

// ── Rewriting one color ────────────────────────────────────────────────────

/**
 * Inside Tailwind classes the math is written `CALC(…)`. CSS function names are
 * case-insensitive, and Tailwind 3 only respaces values after a lowercase
 * `calc(`, where it turns `drop-shadow` into `drop - shadow` and `-8px` into
 * `- 8px`. Tailwind 4 passes either through.
 */
function fmt(syntax) {
  return syntax === "tw"
    ? { glow: `var(${GLOW_VAR},1)`, mul: (a) => `CALC(${a}*var(${GLOW_VAR},1))`, sp: "", slash: "/", comma: "," }
    : { glow: `var(${GLOW_VAR}, 1)`, mul: (a) => `calc(${a} * var(${GLOW_VAR}, 1))`, sp: " ", slash: " / ", comma: ", " };
}

/** Returns the color with its alpha scaled by the glow multiplier, or null if it can't. */
export function scaleColor(color, syntax) {
  const f = fmt(syntax);
  const fn = /^([a-z-]+)\(([\s\S]*)\)$/i.exec(color);

  if (fn && /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch)$/i.test(fn[1])) {
    const name = fn[1];
    const inner = fn[2];
    // Modern syntax: alpha after a depth-0 slash.
    const slashParts = splitTop(inner, (c) => c === "/");
    if (slashParts.length === 2) {
      const before = slashParts[0].text.replace(/[\s_]+$/, "");
      const alpha = slashParts[1].text.replace(/^[\s_]+/, "").trim();
      return `${name}(${before}${f.slash}${f.mul(alpha)})`;
    }
    const commaParts = splitTop(inner, (c) => c === ",");
    if (commaParts.length === 4) {
      const alpha = commaParts[3].text.trim();
      const head = inner.slice(0, commaParts[3].start);
      return `${name}(${head}${f.sp}${f.mul(alpha)})`;
    }
    if (commaParts.length === 3) return `${name}(${inner}${f.comma}${f.glow})`;
    return `${name}(${inner.replace(/[\s_]+$/, "")}${f.slash}${f.glow})`;
  }

  const rgba = HEX.test(color) || /^white$/i.test(color) ? literalRgba(color) : null;
  if (rgba) {
    const channels = [rgba.r, rgba.g, rgba.b].join(syntax === "tw" ? "_" : " ");
    const alpha = rgba.a === 1 ? f.glow : f.mul(+rgba.a.toFixed(3));
    return `rgb(${channels}${f.slash}${alpha})`;
  }

  // color-mix, currentColor, bare variables: mix toward transparent. A mix
  // percentage can't pass 100%, so the multiplier is clamped for these.
  const pct =
    syntax === "tw"
      ? `CALC(CLAMP(0,var(${GLOW_VAR},1),1)*100%)`
      : `calc(clamp(0, var(${GLOW_VAR}, 1), 1) * 100%)`;
  return syntax === "tw"
    ? `color-mix(in_srgb,${color}_${pct},transparent)`
    : `color-mix(in srgb, ${color} ${pct}, transparent)`;
}

// ── Shadow lists ───────────────────────────────────────────────────────────

/**
 * Rewrites the glow layers in a box-shadow / text-shadow list, or the single
 * shadow inside drop-shadow(). Returns { text, changed, skipped, unknown }.
 */
export function rewriteShadowList(value, syntax, { single = false } = {}) {
  const sepSpace = syntax === "tw" ? (c) => c === "_" : (c) => /\s/.test(c);
  const layers = single ? [{ text: value, start: 0 }] : splitTop(value, (c) => c === ",");
  let changed = 0;
  let unknown = 0;
  const out = layers.map((layer) => {
    const raw = layer.text;
    if (raw.includes(GLOW_VAR)) return raw;
    const tokens = splitTop(raw, sepSpace).filter((t) => t.text.trim() !== "");
    if (tokens.length === 0) return raw;
    if (tokens.length === 1 && /^(none|initial|inherit|unset)$/i.test(tokens[0].text.trim())) return raw;

    // Lengths in order; a lone variable or interpolation after them is the color.
    const lengths = [];
    let color = null;
    let bail = false;
    for (const t of tokens) {
      const v = t.text.trim();
      if (/^inset$/i.test(v)) continue;
      if (isColor(v)) color = { ...t, text: v };
      else if (isLength(v) || /^var\(/i.test(v) || v.includes("${")) lengths.push({ ...t, text: v });
      else bail = true;
    }
    if (!color && lengths.length >= 3) {
      const last = lengths[lengths.length - 1];
      if (/^var\(/i.test(last.text) || isInterpolation(last.text)) color = lengths.pop();
    }
    if (bail || !color) {
      // Something we can't read sits next to a color that would glow: say so.
      if (color ? isGlowColor(color.text) : tokens.some((t) => t.text.includes("${"))) unknown++;
      return raw;
    }
    const blur = lengths[2]?.text;
    if (blur === undefined || isZero(blur)) return raw;
    if (!isGlowColor(color.text) || /\/[\s_]*0?\.?0+[\s_]*\)$/.test(color.text)) return raw;

    const lead = raw.slice(0, color.start + raw.slice(color.start).indexOf(color.text));
    const tail = raw.slice(lead.length + color.text.length);
    changed++;
    return lead + scaleColor(color.text, syntax) + tail;
  });
  return { text: out.join(single ? "" : ","), changed, unknown };
}

/** Rewrites every drop-shadow(…) inside a filter list. */
export function rewriteFilterList(value, syntax) {
  let changed = 0;
  let unknown = 0;
  let text = "";
  let i = 0;
  const re = /drop-shadow\(/gi;
  let m;
  while ((m = re.exec(value))) {
    const open = m.index + m[0].length - 1;
    const end = closeOf(value, open);
    if (end === -1) break;
    const inner = value.slice(open + 1, end - 1);
    const r = rewriteShadowList(inner, syntax, { single: true });
    changed += r.changed;
    unknown += r.unknown;
    text += value.slice(i, open + 1) + r.text + ")";
    i = end;
    re.lastIndex = end;
  }
  return { text: text + value.slice(i), changed, unknown };
}

/** Radial-gradient stops lit by a neon variable, in a gradient that fades to transparent, are spill light. */
export function rewriteGradients(value, syntax) {
  let changed = 0;
  let text = "";
  let i = 0;
  const re = /radial-gradient\(/gi;
  let m;
  while ((m = re.exec(value))) {
    const open = m.index + m[0].length - 1;
    const end = closeOf(value, open);
    if (end === -1) break;
    const inner = value.slice(open + 1, end - 1);
    // Spill fades out to nothing. A gradient that ends in a color is a fill (a lens, a screen) and stays.
    if (!/transparent|\/[\s_]*0\)/i.test(inner)) {
      text += value.slice(i, end);
      i = end;
      re.lastIndex = end;
      continue;
    }
    const stops = splitTop(inner, (c) => c === ",").map((stop) => {
      if (stop.text.includes(GLOW_VAR)) return stop.text;
      return stop.text.replace(/(rgba?|hsla?|oklch)\(\s*var\(--[\w-]+\)[^()]*(\([^()]*\))?[^()]*\)/gi, (color) => {
        if (/var\(--(?![\w-]*(white|black))/i.test(color)) {
          changed++;
          return scaleColor(color, syntax);
        }
        return color;
      });
    });
    text += value.slice(i, open + 1) + stops.join(",") + ")";
    i = end;
    re.lastIndex = end;
  }
  return { text: text + value.slice(i), changed };
}

// ── Contexts inside a string ───────────────────────────────────────────────

const TW_OPENERS = [
  { re: /(?<![\w-])drop-shadow-\[/g, kind: "drop" },
  { re: /(?<![\w-]|drop-)shadow-\[/g, kind: "shadow" },
  { re: /\[(?:box-shadow|text-shadow):/g, kind: "shadow" },
  { re: /\[(?:-webkit-)?filter:/g, kind: "filter" },
  { re: /(?<![\w-])bg-\[(?=radial-gradient)/g, kind: "gradient" },
  { re: /\[background(?:-image)?:(?=[^\]]*radial-gradient)/g, kind: "gradient" },
];

/**
 * Rewrites a chunk of text that may hold Tailwind classes, CSS declarations, or
 * be a shadow/filter value itself. `whole` says what the whole string is when
 * its owner (a `boxShadow:` property, say) tells us.
 */
export function rewriteText(text, whole) {
  const edits = [];
  let unknown = 0;
  const stats = { shadow: 0, filter: 0, gradient: 0, inline: 0, css: 0 };

  const push = (start, end, replacement, kind, count) => {
    if (count > 0 && replacement !== text.slice(start, end)) {
      edits.push({ start, end, replacement });
      stats[kind] += count;
    }
  };

  if (whole === "shadow" || whole === "filter") {
    const r = whole === "shadow" ? rewriteShadowList(text, "css") : rewriteFilterList(text, "css");
    unknown += r.unknown;
    push(0, text.length, r.text, "inline", r.changed);
    return finish(text, edits, stats, unknown);
  }

  // Tailwind arbitrary values.
  for (const { re, kind } of TW_OPENERS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const bracket = m[0].startsWith("[") ? m.index : m.index + m[0].length - 1;
      const end = closeOf(text, bracket);
      if (end === -1) continue;
      const valueStart = m.index + m[0].length;
      const value = text.slice(valueStart, end - 1);
      const r =
        kind === "shadow"
          ? rewriteShadowList(value, "tw")
          : kind === "drop"
            ? rewriteShadowList(value, "tw", { single: true })
            : kind === "filter"
              ? rewriteFilterList(value, "tw")
              : { ...rewriteGradients(value, "tw"), unknown: 0 };
      unknown += r.unknown;
      push(valueStart, end - 1, r.text, kind === "drop" ? "filter" : kind, r.changed);
      re.lastIndex = end;
    }
  }

  // CSS declarations (style tags, keyframes).
  const decl = /(?<![[\w-])(-webkit-)?(box-shadow|text-shadow|filter|background|background-image)\s*:\s*/g;
  let m;
  while ((m = decl.exec(text))) {
    const start = m.index + m[0].length;
    let end = start;
    let depth = 0;
    for (; end < text.length; end++) {
      const c = text[end];
      if (c === "$" && text[end + 1] === "{") {
        end = skipInterpolation(text, end);
        continue;
      }
      if (c === "(") depth++;
      else if (c === ")") depth--;
      else if (depth === 0 && (c === ";" || c === "}" || c === "]" || c === '"')) break;
    }
    const value = text.slice(start, end);
    const prop = m[2];
    const r =
      prop === "filter"
        ? rewriteFilterList(value, "css")
        : prop.startsWith("background")
          ? { ...rewriteGradients(value, "css"), unknown: 0 }
          : rewriteShadowList(value, "css");
    unknown += r.unknown;
    push(start, end, r.text, prop.startsWith("background") ? "gradient" : "css", r.changed);
    decl.lastIndex = end;
  }

  // A bare value: the string is a shadow list or a filter on its own.
  if (edits.length === 0 && !/[[\]:;{}]/.test(text.replace(/\$\{[^}]*\}/g, ""))) {
    if (/drop-shadow\(/i.test(text)) {
      const r = rewriteFilterList(text, "css");
      unknown += r.unknown;
      push(0, text.length, r.text, "inline", r.changed);
    } else if (looksLikeShadow(text)) {
      const r = rewriteShadowList(text, "css");
      unknown += r.unknown;
      push(0, text.length, r.text, "inline", r.changed);
    } else if (/radial-gradient\(/i.test(text)) {
      const r = rewriteGradients(text, "css");
      push(0, text.length, r.text, "gradient", r.changed);
    }
  }

  return finish(text, edits, stats, unknown);
}

/** Every layer is lengths plus one color: "0 0 12px rgb(…)". */
function looksLikeShadow(text) {
  const layers = splitTop(text.trim(), (c) => c === ",");
  return layers.every((layer) => {
    const tokens = splitTop(layer.text.trim(), (c) => /\s/.test(c)).map((t) => t.text).filter(Boolean);
    const lengths = tokens.filter((t) => isLength(t) || isInterpolation(t)).length;
    const colors = tokens.filter((t) => isColor(t)).length;
    const rest = tokens.filter((t) => !isLength(t) && !isColor(t) && !isInterpolation(t) && !/^inset$/i.test(t));
    return lengths >= 2 && colors === 1 && rest.length === 0;
  });
}

function finish(text, edits, stats, unknown) {
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  let lastStart = Infinity;
  for (const e of edits) {
    if (e.end > lastStart) continue;
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
    lastStart = e.start;
  }
  return { text: out, stats, unknown };
}

// ── Files ──────────────────────────────────────────────────────────────────

const SHADOW_PROPS = /^(boxShadow|textShadow|WebkitBoxShadow)$/;
const FILTER_PROPS = /^(filter|WebkitFilter)$/;

/** What the owner of a literal says it is: a style property or a shadow-named variable. */
function ownerKind(node) {
  let n = node;
  for (let depth = 0; n.parent && depth < 6; depth++) {
    const p = n.parent;
    if (ts.isPropertyAssignment(p) && p.initializer === n) {
      const name = p.name.getText().replace(/^["']|["']$/g, "");
      if (SHADOW_PROPS.test(name)) return "shadow";
      if (FILTER_PROPS.test(name)) return "filter";
      return null;
    }
    if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && p.right === n) {
      const name = p.left.getText();
      if (/\.(boxShadow|textShadow)$/.test(name)) return "shadow";
      if (/\.filter$/.test(name)) return "filter";
      return null;
    }
    if (ts.isConditionalExpression(p) || ts.isParenthesizedExpression(p) || ts.isTemplateSpan(p) || ts.isBinaryExpression(p)) {
      n = p;
      continue;
    }
    return null;
  }
  return null;
}

/** Literals (strings and templates) in a TS/TSX file, with their kind of owner. */
function literals(sourceFile) {
  const found = [];
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent)) return;
      found.push({ node, start: node.getStart(sourceFile) + 1, end: node.getEnd() - 1 });
      return;
    }
    if (ts.isTemplateExpression(node)) {
      found.push({ node, start: node.getStart(sourceFile) + 1, end: node.getEnd() - 1 });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

// Blurs that aren't light: a black needle shadow, motion blur on rolling digits.
const NOT_GLOW = { "gauge.tsx": ["[filter:blur(1.5px)]"] };

const BLUR = /(?<![\w-])(?<!backdrop-)blur-\[\d|(?<!backdrop-)filter:\s*blur\(/;
const CANVAS_GLOW = /\bshadowBlur\b|createRadialGradient|createConicGradient|globalCompositeOperation\s*=\s*["']lighter["']/;
const READS_GLOW = /getPropertyValue\(\s*["']--neon-glow["']\s*\)/;

/**
 * Glow the text rewrite can't reach, still not reading `--neon-glow`:
 * canvas drawing, blurred copies used as halos, and elements drawn through an SVG blur filter.
 */
export function findHandWorkMisses(source, fileName = "file.tsx") {
  const misses = [];
  const base = path.basename(fileName);
  const lineOf = (index) => source.slice(0, index).split("\n").length;

  // Canvas: the file must read the token (with a finite check, so 0 stays 0).
  if (/getContext\(\s*["']2d["']/.test(source) && CANVAS_GLOW.test(source)) {
    if (!READS_GLOW.test(source)) misses.push({ line: 1, text: "canvas glow doesn't read --neon-glow" });
    else if (!/Number\.isFinite/.test(source)) misses.push({ line: 1, text: "--neon-glow is read without a finite check" });
  }

  // Blurred copies: the literal that blurs must also scale by the token.
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const lit of literals(sf)) {
    const text = source.slice(lit.start, lit.end);
    if (!BLUR.test(text) || text.includes(GLOW_VAR)) continue;
    if ((NOT_GLOW[base] ?? []).some((snippet) => text.includes(snippet))) continue;
    misses.push({ line: lineOf(lit.start), text: `blurred copy without ${GLOW_VAR}: ${text.slice(0, 100)}` });
  }

  // SVG blur filters: either the filter scales itself (flood-opacity at the token)
  // or every element drawn through it does.
  const selfScaled = new Set();
  for (const m of source.matchAll(/<filter\b[^>]*?\bid=\{(`[^`]*`|[^{}]*)\}[\s\S]*?<\/filter>/g)) {
    if (!/feGaussianBlur/.test(m[0]) || !m[0].includes(GLOW_VAR)) continue;
    selfScaled.add(normalizeId(m[1]));
  }
  for (const m of source.matchAll(/<[a-z]+\b[^<>]*?filter=\{`url\(#\$\{([^`]*?)\)`\}[^<>]*?\/?>/g)) {
    const ref = normalizeId("${" + m[1]);
    const filterDef = new RegExp(`<filter\\b[^>]*\\bid=\\{[^>]*${escape(ref.replace(/^\$\{|\}$/g, ""))}`);
    if (!filterDef.test(source)) continue;
    const def = source.slice(source.search(filterDef));
    if (!/^[\s\S]*?feGaussianBlur[\s\S]*?<\/filter>/.test(def.slice(0, def.indexOf("</filter>") + 9))) continue;
    if (selfScaled.has(ref) || m[0].includes(GLOW_VAR)) continue;
    misses.push({ line: lineOf(m.index), text: `drawn through a blur filter without ${GLOW_VAR}: ${m[0].slice(0, 100)}` });
  }
  return misses;
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `\`${uid}-glow\`` and `${uid}-glow` and `id("tube")` and `${id("tube")}` all name the same filter. */
function normalizeId(raw) {
  const t = raw.trim();
  if (t.startsWith("`")) return t.slice(1, -1);
  if (t.startsWith("${")) return t;
  return "${" + t + "}";
}

/** Transforms one source file. Returns the new text and what changed. */
export function transformSource(source, fileName = "file.tsx") {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const stats = { shadow: 0, filter: 0, gradient: 0, inline: 0, css: 0 };
  let unknown = 0;
  for (const lit of literals(sf)) {
    const text = source.slice(lit.start, lit.end);
    if (!/shadow|filter|gradient|\d(px|em|rem)/.test(text)) continue;
    const r = rewriteText(text, ownerKind(lit.node));
    unknown += r.unknown;
    for (const k of Object.keys(stats)) stats[k] += r.stats[k];
    if (r.text !== text) edits.push({ start: lit.start, end: lit.end, replacement: r.text });
  }
  // Templates contain their nested literals; keep the outer edit, drop overlapping inner ones.
  edits.sort((a, b) => a.start - b.start || b.end - a.end);
  const kept = [];
  for (const e of edits) {
    const prev = kept[kept.length - 1];
    if (prev && e.start < prev.end) continue;
    kept.push(e);
  }
  let out = source;
  for (const e of kept.reverse()) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);

  const handWork = findHandWorkMisses(out, fileName).map((m) => m.text.split(":")[0]);
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return { text: out, changed: total, stats, unknown, handWork };
}

/**
 * Glow layers in a file that don't read `--neon-glow`, as short snippets.
 * Running the transform and seeing nothing change is the definition.
 */
export function findUntokenedGlow(source, fileName = "file.tsx") {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const misses = [];
  for (const lit of literals(sf)) {
    const text = source.slice(lit.start, lit.end);
    if (!/shadow|filter|gradient|\d(px|em|rem)/.test(text)) continue;
    const r = rewriteText(text, ownerKind(lit.node));
    if (r.text !== text || r.unknown > 0) {
      const line = source.slice(0, lit.start).split("\n").length;
      misses.push({ line, text: text.length > 140 ? `${text.slice(0, 137)}…` : text });
    }
  }
  return misses;
}

// ── CLI ────────────────────────────────────────────────────────────────────

function listFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs
    .readdirSync(target)
    .filter((f) => /\.(tsx|ts|css)$/.test(f))
    .sort()
    .map((f) => path.join(target, f));
}

function main(argv) {
  const args = argv.slice(2);
  const flag = (name) => args.includes(name);
  const option = (name) => {
    const i = args.indexOf(name);
    return i === -1 ? null : args[i + 1];
  };
  const optionValues = new Set([option("--out"), option("--report")].filter(Boolean));
  const targets = args.filter((a) => !a.startsWith("--") && !optionValues.has(a));
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const files = (targets.length ? targets : [path.join(root, "src/components/ui")]).flatMap(listFiles);

  const write = flag("--write");
  const out = option("--out");
  const reportFile = option("--report");
  const rows = [];
  let remaining = 0;

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const r = transformSource(source, file);
    const after = findUntokenedGlow(r.text, file);
    remaining += after.length;
    rows.push({ file: path.basename(file), ...r, after });
    if (write && r.text !== source) fs.writeFileSync(file, r.text);
    if (out) {
      fs.mkdirSync(out, { recursive: true });
      fs.writeFileSync(path.join(out, path.basename(file)), r.text);
    }
  }

  if (flag("--check")) {
    const misses = files.flatMap((file) => {
      const source = fs.readFileSync(file, "utf8");
      return [...findUntokenedGlow(source, file), ...findHandWorkMisses(source, file)].map(
        (m) => `${path.relative(root, file)}:${m.line}  ${m.text}`,
      );
    });
    if (misses.length) {
      console.error(`${misses.length} glow layer(s) don't read ${GLOW_VAR}:\n${misses.join("\n")}`);
      process.exit(1);
    }
    console.log(`Every glow reads ${GLOW_VAR}.`);
    return;
  }

  const changed = rows.filter((r) => r.changed > 0);
  const total = changed.reduce((a, r) => a + r.changed, 0);
  const lines = [];
  lines.push(`${write ? "Rewrote" : "Would rewrite"} ${total} glow layer(s) in ${changed.length} of ${rows.length} file(s).`);
  lines.push("");
  lines.push("| File | Layers | Classes | Filters | Gradients | CSS | Inline | Needs hand work |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |");
  for (const r of rows) {
    if (!r.changed && !r.handWork.length && !r.unknown) continue;
    const s = r.stats;
    const hand = [...r.handWork, r.unknown ? `${r.unknown} interpolated layer(s)` : null].filter(Boolean).join("; ");
    lines.push(`| ${r.file} | ${r.changed} | ${s.shadow} | ${s.filter} | ${s.gradient} | ${s.css} | ${s.inline} | ${hand} |`);
  }
  lines.push("");
  lines.push(remaining ? `${remaining} glow layer(s) would still be un-tokened.` : "Nothing un-tokened would remain.");
  const report = lines.join("\n");
  console.log(report);
  if (reportFile) fs.writeFileSync(reportFile, `${report}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv);
