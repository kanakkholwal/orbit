import {
  decodePDFRawStream,
  PDFArray,
  PDFDict,
  type PDFDocument,
  PDFHexString,
  PDFName,
  type PDFObject,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
} from "pdf-lib";

/** One file embedded in a PDF, either in the document's file list or pinned to a page. */
export interface AttachmentInfo {
  id: string;
  name: string;
  description: string;
  mimeType: string;
  size: number;
  data: Uint8Array;
  source: "document" | "page";
  pageIndex?: number;
  modified?: Date;
}

/** A file waiting to be attached on save. */
export interface NewAttachment {
  name: string;
  data: Uint8Array;
  mimeType?: string;
  description?: string;
  modified?: Date;
}

type NamePair = { key: string; value: PDFObject };

const N = (name: string) => PDFName.of(name);

function text(obj: PDFObject | undefined): string {
  if (obj instanceof PDFString || obj instanceof PDFHexString) return obj.decodeText();
  if (obj instanceof PDFName) return obj.decodeText();
  return "";
}

function lookupDict(doc: PDFDocument, obj: PDFObject | undefined): PDFDict | undefined {
  const resolved = obj instanceof PDFRef ? doc.context.lookup(obj) : obj;
  return resolved instanceof PDFDict ? resolved : undefined;
}

function streamBytes(stream: PDFStream): Uint8Array {
  if (stream instanceof PDFRawStream) {
    try {
      return decodePDFRawStream(stream).decode();
    } catch {
      return stream.getContents();
    }
  }
  return stream.getContents();
}

function embeddedFilesDict(doc: PDFDocument): PDFDict | undefined {
  const names = doc.catalog.lookupMaybe(N("Names"), PDFDict);
  return names?.lookupMaybe(N("EmbeddedFiles"), PDFDict);
}

function collectPairs(doc: PDFDocument, node: PDFDict, out: NamePair[], seen: Set<PDFDict>) {
  if (seen.has(node)) return;
  seen.add(node);
  const names = node.lookupMaybe(N("Names"), PDFArray);
  if (names) {
    for (let i = 0; i + 1 < names.size(); i += 2) {
      out.push({ key: text(names.lookup(i)), value: names.get(i + 1) });
    }
  }
  const kids = node.lookupMaybe(N("Kids"), PDFArray);
  if (kids) {
    for (let i = 0; i < kids.size(); i++) {
      const kid = lookupDict(doc, kids.get(i));
      if (kid) collectPairs(doc, kid, out, seen);
    }
  }
}

function readFileSpec(doc: PDFDocument, specObj: PDFObject | undefined, fallbackName: string) {
  const spec = lookupDict(doc, specObj);
  if (!spec) return null;
  const ef = spec.lookupMaybe(N("EF"), PDFDict);
  const streamObj = ef?.lookup(N("UF")) ?? ef?.lookup(N("F"));
  if (!(streamObj instanceof PDFStream)) return null;
  const data = streamBytes(streamObj);
  const params = streamObj.dict.lookupMaybe(N("Params"), PDFDict);
  const modifiedRaw = params?.lookup(N("ModDate")) ?? params?.lookup(N("CreationDate"));
  const modified =
    modifiedRaw instanceof PDFString || modifiedRaw instanceof PDFHexString ? safeDate(modifiedRaw) : undefined;
  const name = text(spec.lookup(N("UF"))) || text(spec.lookup(N("F"))) || fallbackName || "attachment";
  return {
    name: baseName(name),
    description: text(spec.lookup(N("Desc"))),
    mimeType: text(streamObj.dict.lookup(N("Subtype"))),
    size: data.length,
    data,
    modified,
  };
}

function safeDate(value: PDFString | PDFHexString): Date | undefined {
  try {
    const date = value.decodeDate();
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

function baseName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

/** Reads every attachment: the document's embedded file list plus file attachment annotations. */
export function listAttachments(doc: PDFDocument): AttachmentInfo[] {
  const result: AttachmentInfo[] = [];
  const root = embeddedFilesDict(doc);
  if (root) {
    const pairs: NamePair[] = [];
    collectPairs(doc, root, pairs, new Set());
    pairs.forEach((pair, i) => {
      const info = readFileSpec(doc, pair.value, pair.key);
      if (info) result.push({ ...info, id: `doc-${i}`, source: "document" });
    });
  }

  doc.getPages().forEach((page, pageIndex) => {
    const annots = page.node.Annots();
    if (!annots) return;
    for (let i = 0; i < annots.size(); i++) {
      const annot = lookupDict(doc, annots.get(i));
      if (!annot || annot.lookup(N("Subtype")) !== N("FileAttachment")) continue;
      const info = readFileSpec(doc, annot.get(N("FS")), text(annot.lookup(N("Contents"))));
      if (info) result.push({ ...info, id: `page-${pageIndex}-${i}`, source: "page", pageIndex });
    }
  });
  return result;
}

/** Picks a name that doesn't clash with `taken`, e.g. "notes (2).txt". */
export function uniqueName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let n = 2;
  while (taken.has(`${stem} (${n})${ext}`)) n++;
  return `${stem} (${n})${ext}`;
}

function documentNames(doc: PDFDocument): string[] {
  const root = embeddedFilesDict(doc);
  if (!root) return [];
  const pairs: NamePair[] = [];
  collectPairs(doc, root, pairs, new Set());
  return pairs.map((pair) => pair.key);
}

function rewriteNameTree(doc: PDFDocument, keep: (index: number) => boolean) {
  const names = doc.catalog.lookupMaybe(N("Names"), PDFDict);
  const root = embeddedFilesDict(doc);
  if (!names || !root) return;
  const pairs: NamePair[] = [];
  collectPairs(doc, root, pairs, new Set());
  const removedSpecs = new Set<PDFObject>();
  const kept = pairs.filter((pair, i) => {
    if (keep(i)) return true;
    removedSpecs.add(pair.value);
    return false;
  });
  kept.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  if (kept.length === 0) {
    names.delete(N("EmbeddedFiles"));
  } else {
    const flat = doc.context.obj([]);
    for (const pair of kept) {
      flat.push(PDFHexString.fromText(pair.key));
      flat.push(pair.value);
    }
    names.set(N("EmbeddedFiles"), doc.context.obj({ Names: flat }));
  }

  const af = doc.catalog.lookupMaybe(N("AF"), PDFArray);
  if (af && removedSpecs.size > 0) {
    for (let i = af.size() - 1; i >= 0; i--) {
      if (removedSpecs.has(af.get(i))) af.remove(i);
    }
    if (af.size() === 0) doc.catalog.delete(N("AF"));
  }
}

function removePageAttachments(doc: PDFDocument, ids: Set<string>) {
  doc.getPages().forEach((page, pageIndex) => {
    const annots = page.node.Annots();
    if (!annots) return;
    for (let i = annots.size() - 1; i >= 0; i--) {
      if (ids.has(`page-${pageIndex}-${i}`)) annots.remove(i);
    }
  });
}

/** Removes the attachments with `removeIds`, attaches `added`, and keeps the file list sorted. */
export async function applyAttachmentChanges(
  doc: PDFDocument,
  removeIds: Iterable<string>,
  added: NewAttachment[]
): Promise<void> {
  const ids = new Set(removeIds);
  const docIndexes = new Set<number>();
  for (const id of ids) if (id.startsWith("doc-")) docIndexes.add(Number(id.slice(4)));
  removePageAttachments(doc, ids);

  rewriteNameTree(doc, (i) => !docIndexes.has(i));
  if (added.length === 0) return;

  const taken = new Set(documentNames(doc));
  for (const file of added) {
    const name = uniqueName(file.name, taken);
    taken.add(name);
    await doc.attach(file.data, name, {
      mimeType: file.mimeType || undefined,
      description: file.description?.trim() || undefined,
      creationDate: file.modified,
      modificationDate: file.modified,
    });
  }
  await doc.flush();
  rewriteNameTree(doc, () => true);
}
