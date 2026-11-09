/** Converts an HTML fragment to GitHub-flavoured Markdown, for the Markdown to PDF renderer. */
export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,noscript,iframe,svg,head,template").forEach((el) => el.remove());
  const out = blocks(doc.body, 0).trim();
  return out.replace(/\n{3,}/g, "\n\n") + "\n";
}

const esc = (text: string) => text.replace(/([\\`*_{}[\]<>])/g, "\\$1");

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return esc((node.textContent ?? "").replace(/\s+/g, " "));
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const el = node as HTMLElement;
  const inner = () => Array.from(el.childNodes).map(inline).join("");
  switch (el.tagName.toLowerCase()) {
    case "strong":
    case "b": {
      const t = inner().trim();
      return t ? `**${t}**` : "";
    }
    case "em":
    case "i": {
      const t = inner().trim();
      return t ? `*${t}*` : "";
    }
    case "del":
    case "s":
    case "strike": {
      const t = inner().trim();
      return t ? `~~${t}~~` : "";
    }
    case "code":
      return `\`${(el.textContent ?? "").replace(/`/g, "'")}\``;
    case "a": {
      const href = el.getAttribute("href") ?? "";
      const t = inner().trim();
      return href && t ? `[${t}](${href})` : t;
    }
    case "br":
      return "  \n";
    case "img": {
      const src = el.getAttribute("src") ?? "";
      const alt = esc(el.getAttribute("alt") ?? "image").replace(/[\[\]]/g, "");
      return /^(data:image\/(png|jpe?g|gif|webp|svg\+xml)|https?:)/i.test(src) ? "\n\n![" + alt + "](" + src + ")\n\n" : alt === "image" ? "" : alt;
    }
    default:
      return inner();
  }
}

function list(el: HTMLElement, depth: number): string {
  const ordered = el.tagName.toLowerCase() === "ol";
  const lines: string[] = [];
  let n = 1;
  for (const child of Array.from(el.children)) {
    if (child.tagName.toLowerCase() !== "li") continue;
    const parts: string[] = [];
    const nested: string[] = [];
    for (const node of Array.from(child.childNodes)) {
      if (node.nodeType === Node.ELEMENT_NODE && /^(ul|ol)$/i.test((node as HTMLElement).tagName)) nested.push(list(node as HTMLElement, depth + 1));
      else parts.push(inline(node));
    }
    const marker = ordered ? `${n++}.` : "-";
    lines.push(`${"  ".repeat(depth)}${marker} ${parts.join("").trim()}`);
    for (const block of nested) lines.push(block.trimEnd());
  }
  return lines.join("\n");
}

function table(el: HTMLElement): string {
  const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.children).map((cell) => (cell.textContent ?? "").replace(/\s+/g, " ").replace(/\|/g, "\\|").trim())
  );
  if (rows.length === 0) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r: string[]) => Array.from({ length: width }, (_, i) => r[i] ?? "");
  const [head, ...body] = rows.map(pad);
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...body.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

function blocks(parent: Node, depth: number): string {
  const parts: string[] = [];
  let run = "";
  const flush = () => {
    const text = run.replace(/[ \t]+\n/g, "\n").trim();
    if (text) parts.push(text);
    run = "";
  };
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      run += inline(node);
      continue;
    }
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      flush();
      parts.push(`${"#".repeat(Number(tag[1]))} ${inline(el).trim()}`);
    } else if (tag === "p") {
      flush();
      const t = inline(el).trim();
      if (t) parts.push(t);
    } else if (tag === "ul" || tag === "ol") {
      flush();
      parts.push(list(el, depth));
    } else if (tag === "pre") {
      flush();
      parts.push("```\n" + (el.textContent ?? "").replace(/\n$/, "") + "\n```");
    } else if (tag === "blockquote") {
      flush();
      parts.push(blocks(el, depth).split("\n").map((l) => `> ${l}`).join("\n"));
    } else if (tag === "hr") {
      flush();
      parts.push("---");
    } else if (tag === "table") {
      flush();
      parts.push(table(el));
    } else if (/^(div|section|article|main|header|footer|aside|nav|body|figure|figcaption|details|summary|dl|dd|dt|center)$/.test(tag)) {
      flush();
      const inner = blocks(el, depth).trim();
      if (inner) parts.push(inner);
    } else {
      run += inline(el);
    }
  }
  flush();
  return parts.join("\n\n");
}
