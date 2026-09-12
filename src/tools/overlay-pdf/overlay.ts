import { degrees, PDFArray, PDFDocument, type PDFPage } from "pdf-lib";

export type OverlayPosition = "top" | "under";
export type OverlayPages = "first" | "repeat" | "match";
export type OverlayFit = "fit" | "keep";

/** Settings for placing one PDF's pages over or under another's. */
export interface OverlayOptions {
  position: OverlayPosition;
  pages: OverlayPages;
  targets: number[];
  opacity: number;
  fit: OverlayFit;
}

/** A page's visible box: crop box origin and size in PDF points, plus its viewer rotation. */
export interface PageBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/** A rectangle on the visible page, measured from the bottom-left corner with y going up. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Matrix = [number, number, number, number, number, number];

const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

function invert(m: Matrix): Matrix {
  const det = m[0] * m[3] - m[1] * m[2];
  return [
    m[3] / det,
    -m[1] / det,
    -m[2] / det,
    m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det,
    (m[1] * m[4] - m[0] * m[5]) / det,
  ];
}

const normalizeRotation = (r: number) => (((Math.round(r / 90) * 90) % 360) + 360) % 360;

/** Visible width and height after the viewer applies the page rotation. */
export function visibleSize(box: PageBox): { width: number; height: number } {
  const r = normalizeRotation(box.rotation);
  return r === 90 || r === 270 ? { width: box.height, height: box.width } : { width: box.width, height: box.height };
}

/** Maps page user space to visible, upright space (origin bottom-left, y up). */
export function userToVisible(box: PageBox): Matrix {
  const { x, y, width: w, height: h } = box;
  switch (normalizeRotation(box.rotation)) {
    case 90:
      return [0, -1, 1, 0, -y, x + w];
    case 180:
      return [-1, 0, 0, -1, x + w, y + h];
    case 270:
      return [0, 1, -1, 0, y + h, -x];
    default:
      return [1, 0, 0, 1, -x, -y];
  }
}

/** Where the overlay lands on the visible target page. */
export function placeOverlay(
  target: { width: number; height: number },
  overlay: { width: number; height: number },
  fit: OverlayFit
): Rect {
  if (fit === "keep") {
    return { x: 0, y: target.height - overlay.height, width: overlay.width, height: overlay.height };
  }
  const scale = Math.min(target.width / overlay.width, target.height / overlay.height);
  const width = overlay.width * scale;
  const height = overlay.height * scale;
  return { x: (target.width - width) / 2, y: (target.height - height) / 2, width, height };
}

/** Which overlay page (0-based) goes on the `order`-th selected page, which is page `pageIndex`. */
export function overlayPageFor(mode: OverlayPages, pageIndex: number, order: number, overlayCount: number): number | null {
  if (overlayCount === 0) return null;
  if (mode === "first") return 0;
  if (mode === "repeat") return order % overlayCount;
  return pageIndex < overlayCount ? pageIndex : null;
}

/** drawPage arguments that show `overlay` upright inside `rect` on the visible `target` page. */
export function drawArgs(target: PageBox, overlay: PageBox, rect: Rect) {
  const overlayUpright = userToVisible({ ...overlay, x: 0, y: 0 });
  const size = visibleSize(overlay);
  const place: Matrix = [rect.width / size.width, 0, 0, rect.height / size.height, rect.x, rect.y];
  const m = multiply(invert(userToVisible(target)), multiply(place, overlayUpright));
  const xScale = Math.hypot(m[0], m[1]);
  const yScale = Math.hypot(m[2], m[3]);
  const angle = (Math.atan2(m[1], m[0]) * 180) / Math.PI;
  return { x: m[4], y: m[5], xScale, yScale, rotate: angle };
}

function pageBox(page: PDFPage): PageBox {
  const crop = page.getCropBox();
  return { x: crop.x, y: crop.y, width: crop.width, height: crop.height, rotation: page.getRotation().angle };
}

/** Draws overlay pages onto the selected pages of `main` and returns the saved PDF. */
export async function buildOverlay(
  mainBytes: ArrayBuffer | Uint8Array,
  overlayBytes: ArrayBuffer | Uint8Array,
  options: OverlayOptions
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(mainBytes, { ignoreEncryption: true });
  const overlayDoc = await PDFDocument.load(overlayBytes, { ignoreEncryption: true });
  const pages = doc.getPages();
  const overlayPages = overlayDoc.getPages();

  const plan = options.targets
    .filter((i) => i >= 0 && i < pages.length)
    .map((pageIndex, order) => ({ pageIndex, overlayIndex: overlayPageFor(options.pages, pageIndex, order, overlayPages.length) }))
    .filter((step): step is { pageIndex: number; overlayIndex: number } => step.overlayIndex !== null);

  const used = [...new Set(plan.map((step) => step.overlayIndex))];
  const embedded = await doc.embedPages(
    used.map((i) => overlayPages[i]),
    used.map((i) => {
      const crop = overlayPages[i].getCropBox();
      return { left: crop.x, bottom: crop.y, right: crop.x + crop.width, top: crop.y + crop.height };
    })
  );
  const byIndex = new Map(used.map((index, i) => [index, embedded[i]]));
  const opacity = Math.min(1, Math.max(0, options.opacity));

  for (const step of plan) {
    const page = pages[step.pageIndex];
    const target = pageBox(page);
    const source = pageBox(overlayPages[step.overlayIndex]);
    const rect = placeOverlay(visibleSize(target), visibleSize(source), options.fit);
    const args = drawArgs(target, source, rect);
    const existing = page.node.Contents();
    const before = existing instanceof PDFArray ? existing.size() : existing ? 1 : 0;

    page.drawPage(byIndex.get(step.overlayIndex)!, {
      x: args.x,
      y: args.y,
      xScale: args.xScale,
      yScale: args.yScale,
      rotate: degrees(args.rotate),
      opacity: opacity < 1 ? opacity : undefined,
    });

    if (options.position === "under") {
      const contents = page.node.Contents();
      if (contents instanceof PDFArray && contents.size() > before) {
        const drawn = contents.get(contents.size() - 1);
        contents.remove(contents.size() - 1);
        contents.insert(0, drawn);
      }
    }
  }

  return doc.save();
}
