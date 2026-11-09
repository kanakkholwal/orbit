import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { yieldToMain } from "$lib/device-limits";

const EMU_PER_PT = 12700;
const SAFE = /[^\x20-\x7E\xA0-\xFF]/g;
const MAP: Record<string, string> = { "‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", "•": "-", "…": "...", " ": " " };

const clean = (text: string) => text.replace(/[‘’“”–—•… ]/g, (c) => MAP[c] ?? "?").replace(SAFE, "?");

const parse = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");
const kids = (el: Element, name: string) => Array.from(el.children).filter((c) => c.nodeName === name);
const first = (el: Element | null | undefined, path: string[]): Element | null => {
  let cur: Element | null | undefined = el;
  if (!cur) return null;
  for (const part of path) {
    cur = kids(cur, part)[0] ?? null;
    if (!cur) return null;
  }
  return cur ?? null;
};

function colour(fill: Element | null | undefined) {
  const hex = first(fill, ["a:srgbClr"])?.getAttribute("val");
  if (!hex || hex.length !== 6) return null;
  return rgb(parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4), 16) / 255);
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxOf(sp: Element, size: { w: number; h: number }, kind: "title" | "body" | "other"): Box | null {
  const xfrm = first(sp, ["p:spPr", "a:xfrm"]) ?? first(sp, ["p:xfrm"]);
  const off = first(xfrm, ["a:off"]);
  const ext = first(xfrm, ["a:ext"]);
  if (off && ext) {
    return {
      x: Number(off.getAttribute("x")) / EMU_PER_PT,
      y: Number(off.getAttribute("y")) / EMU_PER_PT,
      w: Number(ext.getAttribute("cx")) / EMU_PER_PT,
      h: Number(ext.getAttribute("cy")) / EMU_PER_PT,
    };
  }
  if (kind === "title") return { x: size.w * 0.06, y: size.h * 0.05, w: size.w * 0.88, h: size.h * 0.16 };
  if (kind === "body") return { x: size.w * 0.06, y: size.h * 0.24, w: size.w * 0.88, h: size.h * 0.68 };
  return null;
}

interface Run {
  text: string;
  bold: boolean;
  size: number;
  color: ReturnType<typeof rgb> | null;
}
interface Para {
  runs: Run[];
  align: "l" | "ctr" | "r";
  bullet: boolean;
}

function paragraphs(body: Element, base: number): Para[] {
  return kids(body, "a:p").map((p) => {
    const pPr = first(p, ["a:pPr"]);
    const runs: Run[] = [];
    for (const r of Array.from(p.children)) {
      if (r.nodeName !== "a:r" && r.nodeName !== "a:fld") continue;
      const rPr = first(r, ["a:rPr"]);
      const text = first(r, ["a:t"])?.textContent ?? "";
      if (!text) continue;
      runs.push({
        text,
        bold: rPr?.getAttribute("b") === "1",
        size: rPr?.getAttribute("sz") ? Number(rPr.getAttribute("sz")) / 100 : base,
        color: colour(first(rPr, ["a:solidFill"])),
      });
    }
    const algn = pPr?.getAttribute("algn");
    return { runs, align: algn === "ctr" ? "ctr" : algn === "r" ? "r" : "l", bullet: !!first(pPr, ["a:buChar"]) || !!first(pPr, ["a:buAutoNum"]) };
  });
}

function drawText(page: PDFPage, fonts: { regular: PDFFont; bold: PDFFont }, paras: Para[], box: Box, pageH: number) {
  let scale = 1;
  const layout = (s: number) => {
    const lines: { text: string; font: PDFFont; size: number; color: ReturnType<typeof rgb> | null; align: Para["align"] }[] = [];
    let height = 0;
    for (const para of paras) {
      const size = (para.runs[0]?.size ?? 18) * s;
      const text = clean((para.bullet ? "- " : "") + para.runs.map((r) => r.text).join(""));
      const font = para.runs[0]?.bold ? fonts.bold : fonts.regular;
      const words = text.split(/\s+/).filter(Boolean);
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > box.w && line) {
          lines.push({ text: line, font, size, color: para.runs[0]?.color ?? null, align: para.align });
          height += size * 1.2;
          line = word;
        } else line = next;
      }
      lines.push({ text: line, font, size, color: para.runs[0]?.color ?? null, align: para.align });
      height += size * 1.2 + size * 0.25;
    }
    return { lines, height };
  };
  let result = layout(scale);
  for (let i = 0; i < 4 && result.height > box.h; i++) {
    scale *= 0.85;
    result = layout(scale);
  }
  let y = box.y;
  for (const line of result.lines) {
    y += line.size * 1.2;
    const width = line.font.widthOfTextAtSize(line.text, line.size);
    const x = line.align === "ctr" ? box.x + (box.w - width) / 2 : line.align === "r" ? box.x + box.w - width : box.x;
    if (line.text) page.drawText(line.text, { x, y: pageH - y + line.size * 0.25, size: line.size, font: line.font, color: line.color ?? rgb(0.1, 0.1, 0.1) });
  }
}

export async function pptxToPdf(file: File, progress: (current: number, total: number) => void): Promise<{ bytes: Uint8Array; slides: number; skipped: number }> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const text = async (path: string) => (await zip.file(path)?.async("string")) ?? "";

  const pres = parse(await text("ppt/presentation.xml"));
  const sz = pres.getElementsByTagName("p:sldSz")[0];
  const size = { w: Number(sz?.getAttribute("cx") ?? 9144000) / EMU_PER_PT, h: Number(sz?.getAttribute("cy") ?? 5143500) / EMU_PER_PT };

  const rels = parse(await text("ppt/_rels/presentation.xml.rels"));
  const target = new Map<string, string>();
  for (const r of Array.from(rels.getElementsByTagName("Relationship"))) target.set(r.getAttribute("Id") ?? "", r.getAttribute("Target") ?? "");
  const order = Array.from(pres.getElementsByTagName("p:sldId")).map((el) => target.get(el.getAttribute("r:id") ?? "") ?? "").filter(Boolean);
  if (order.length === 0) throw new Error("No slides found in this file.");

  const pdf = await PDFDocument.create();
  const fonts = { regular: await pdf.embedFont(StandardFonts.Helvetica), bold: await pdf.embedFont(StandardFonts.HelveticaBold) };
  let skipped = 0;

  for (let i = 0; i < order.length; i++) {
    progress(i + 1, order.length);
    const slidePath = `ppt/${order[i].replace(/^\//, "").replace(/^ppt\//, "")}`;
    const slide = parse(await text(slidePath));
    const slideRels = parse(await text(slidePath.replace("slides/", "slides/_rels/") + ".rels"));
    const media = new Map<string, string>();
    for (const r of Array.from(slideRels.getElementsByTagName("Relationship"))) media.set(r.getAttribute("Id") ?? "", r.getAttribute("Target") ?? "");

    const page = pdf.addPage([size.w, size.h]);
    const bg = colour(first(slide.getElementsByTagName("p:bg")[0] ?? null, ["p:bgPr", "a:solidFill"]));
    if (bg) page.drawRectangle({ x: 0, y: 0, width: size.w, height: size.h, color: bg });

    const tree = slide.getElementsByTagName("p:spTree")[0];
    const shapes = tree ? Array.from(tree.getElementsByTagName("*")).filter((el) => el.nodeName === "p:sp" || el.nodeName === "p:pic") : [];

    for (const el of shapes) {
      if (el.nodeName === "p:pic") {
        const id = first(first(el, ["p:blipFill"]), ["a:blip"])?.getAttribute("r:embed");
        const rel = id ? media.get(id) : null;
        const box = boxOf(el, size, "other");
        if (!rel || !box) continue;
        const path = `ppt/${rel.replace(/^\.\.\//, "")}`;
        const data = await zip.file(path)?.async("uint8array");
        if (!data) continue;
        try {
          const image = /\.png$/i.test(path) ? await pdf.embedPng(data) : /\.jpe?g$/i.test(path) ? await pdf.embedJpg(data) : null;
          if (!image) {
            skipped++;
            continue;
          }
          page.drawImage(image, { x: box.x, y: size.h - box.y - box.h, width: box.w, height: box.h });
        } catch {
          skipped++;
        }
        continue;
      }

      const ph = first(first(el, ["p:nvSpPr"]), ["p:nvPr"]);
      const type = first(ph, ["p:ph"])?.getAttribute("type");
      const kind = type === "title" || type === "ctrTitle" ? "title" : first(ph, ["p:ph"]) ? "body" : "other";
      const box = boxOf(el, size, kind);
      if (!box) continue;
      const fill = colour(first(first(el, ["p:spPr"]), ["a:solidFill"]));
      if (fill) page.drawRectangle({ x: box.x, y: size.h - box.y - box.h, width: box.w, height: box.h, color: fill });
      const body = first(el, ["p:txBody"]);
      if (!body) continue;
      const paras = paragraphs(body, kind === "title" ? 32 : 18).filter((p) => p.runs.length > 0);
      if (paras.length) drawText(page, fonts, paras, box, size.h);
    }
    await yieldToMain();
  }
  return { bytes: await pdf.save(), slides: order.length, skipped };
}
