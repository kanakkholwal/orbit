import type { Block, CreatorDoc } from "./types";

const FIELD = /\{\{\s*([a-zA-Z][\w-]*)\s*\}\}/g;

/** Placeholders Forme fills in itself on every page. */
export const RESERVED_FIELDS = new Set(["pageNumber", "totalPages"]);

export type InlineRun = { text: string; bold: boolean; italic: boolean };

/** Replaces `{{field}}` with its value; unknown or empty fields stay visible. */
export function fill(text: string, data: Record<string, string>): string {
  return text.replace(FIELD, (match, key: string) => {
    if (RESERVED_FIELDS.has(key)) return match;
    const value = data[key];
    return value?.trim() ? value : match;
  });
}

function collectStrings(value: unknown, out: string[]) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, out);
  else if (value && typeof value === "object") for (const item of Object.values(value)) collectStrings(item, out);
}

/** Field names used anywhere in the document, in first-seen order. */
export function findFields(doc: Pick<CreatorDoc, "blocks" | "settings">): string[] {
  const strings: string[] = [];
  collectStrings(doc.blocks.map((block: Block) => (block.type === "image" || block.type === "signature" ? { ...block.props, src: "", image: "" } : block.props)), strings);
  collectStrings([doc.settings.header, doc.settings.footer, doc.settings.watermark], strings);
  const seen = new Set<string>();
  for (const text of strings) {
    for (const match of text.matchAll(FIELD)) {
      if (!RESERVED_FIELDS.has(match[1])) seen.add(match[1]);
    }
  }
  return [...seen];
}

/** Human label for a field key: `due_date` becomes "Due date". */
export function fieldLabel(key: string): string {
  const spaced = key.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Splits `**bold**` and `*italic*` markers into styled runs. */
export function parseInline(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) runs.push({ text: text.slice(last, index), bold: false, italic: false });
    const token = match[0];
    if (token.startsWith("**")) runs.push({ text: token.slice(2, -2), bold: true, italic: false });
    else runs.push({ text: token.slice(1, -1), bold: false, italic: true });
    last = index + token.length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), bold: false, italic: false });
  return runs;
}
