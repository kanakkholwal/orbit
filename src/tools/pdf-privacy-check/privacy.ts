import {
    decodePDFRawStream,
    PDFArray,
    PDFCheckBox,
    PDFDict,
    PDFDocument,
    PDFDropdown,
    PDFHexString,
    PDFName,
    PDFObject,
    PDFOptionList,
    PDFRadioGroup,
    PDFRawStream,
    PDFRef,
    PDFStream,
    PDFString,
    PDFTextField,
} from 'pdf-lib';

export interface PrivacyScan {
    pages: number;
    info: { label: string; value: string }[];
    xmp: { streams: number; people: string[]; tools: string[]; historySteps: number };
    appData: number;
    attachments: { name: string; size?: number }[];
    scripts: number;
    launches: number;
    openAction: boolean;
    fields: { total: number; filled: number };
    comments: { count: number; authors: string[] };
    links: string[];
    submitTargets: string[];
    earlierVersions: boolean;
}

export interface CleanOptions {
    comments: boolean;
}

export type Severity = 'high' | 'medium' | 'low';
export type Handling = 'removed' | 'optional' | 'kept';

export interface Finding {
    id: string;
    severity: Severity;
    title: string;
    detail: string;
    items: string[];
    handling: Handling;
}

const COMMENT_TYPES = new Set([
    'Text',
    'FreeText',
    'Line',
    'Square',
    'Circle',
    'Polygon',
    'PolyLine',
    'Highlight',
    'Underline',
    'Squiggly',
    'StrikeOut',
    'Stamp',
    'Caret',
    'Ink',
    'Sound',
    'Popup',
]);

const INFO_LABELS: Record<string, string> = {
    Title: 'Title',
    Author: 'Author',
    Subject: 'Subject',
    Keywords: 'Keywords',
    Creator: 'Made with',
    Producer: 'Saved with',
    CreationDate: 'Created',
    ModDate: 'Last changed',
    Trapped: 'Trapped',
};

const name = (key: string) => PDFName.of(key);

const pick = <T>(value: PDFObject | undefined, type: { prototype: T }): T | undefined =>
    value instanceof (type as unknown as typeof PDFObject) ? (value as T) : undefined;

function text(obj: PDFObject | undefined): string | undefined {
    if (obj instanceof PDFString || obj instanceof PDFHexString) return obj.decodeText().trim();
    if (obj instanceof PDFName) return obj.decodeText();
    return undefined;
}

function formatDate(raw: string): string {
    const m = raw.match(/^D?:?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
    if (!m) return raw;
    const date = new Date(Date.UTC(+m[1], m[2] ? +m[2] - 1 : 0, m[3] ? +m[3] : 1, m[4] ? +m[4] : 0, m[5] ? +m[5] : 0));
    return Number.isNaN(date.getTime()) ? raw : date.toISOString().slice(0, 16).replace('T', ' ');
}

function children(obj: PDFObject): PDFObject[] {
    if (obj instanceof PDFDict) return obj.values();
    if (obj instanceof PDFArray) return obj.asArray();
    if (obj instanceof PDFStream) return obj.dict.values();
    return [];
}

function visitDicts(doc: PDFDocument, visit: (dict: PDFDict) => void) {
    const walk = (obj: PDFObject) => {
        if (obj instanceof PDFDict) visit(obj);
        if (obj instanceof PDFStream) visit(obj.dict);
        for (const child of children(obj)) if (!(child instanceof PDFRef)) walk(child);
    };
    for (const [, obj] of doc.context.enumerateIndirectObjects()) walk(obj);
}

function nameTree(doc: PDFDocument, root: PDFDict | undefined, depth = 0): [string, PDFObject][] {
    if (!root || depth > 32) return [];
    const out: [string, PDFObject][] = [];
    const names = pick(root.lookup(name('Names')), PDFArray);
    if (names) {
        for (let i = 0; i + 1 < names.size(); i += 2) out.push([text(names.lookup(i)) ?? '', names.get(i + 1)]);
    }
    const kids = pick(root.lookup(name('Kids')), PDFArray);
    if (kids) {
        for (const kid of kids.asArray()) out.push(...nameTree(doc, pick(doc.context.lookup(kid), PDFDict), depth + 1));
    }
    return out;
}

const isRisky = (dict: PDFDict) => {
    const kind = pick(dict.lookup(name('S')), PDFName)?.decodeText();
    return kind === 'JavaScript' || kind === 'Launch' || dict.has(name('JS'));
};

function annotations(doc: PDFDocument): PDFDict[] {
    return doc
        .getPages()
        .flatMap((page) => page.node.Annots()?.asArray() ?? [])
        .map((entry) => pick(doc.context.lookup(entry), PDFDict))
        .filter((annot): annot is PDFDict => !!annot);
}

const subtype = (dict: PDFDict) => pick(dict.lookup(name('Subtype')), PDFName)?.decodeText() ?? '';

function countEof(raw: string): number {
    const eofs = raw.match(/%%EOF/g)?.length ?? 0;
    return raw.slice(0, 1024).includes('/Linearized') ? eofs - 1 : eofs;
}

function findInfo(doc: PDFDocument, raw: string): PDFDict | undefined {
    const { context } = doc;
    const direct = pick(context.lookup(context.trailerInfo.Info), PDFDict);
    if (direct) return direct;
    const refs = [...raw.matchAll(/\/Info\s+(\d+)\s+(\d+)\s+R/g)].reverse();
    for (const [, num, gen] of refs) {
        const dict = pick(context.lookup(PDFRef.of(Number(num), Number(gen))), PDFDict);
        if (dict) return dict;
    }
    return undefined;
}

function readXmp(stream: PDFObject | undefined): string {
    try {
        if (stream instanceof PDFRawStream) return new TextDecoder().decode(decodePDFRawStream(stream).decode());
    } catch {}
    return '';
}

function xmpValues(xml: string, tag: string): string[] {
    const block = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1];
    if (!block) return [];
    const items = [...block.matchAll(/<rdf:li[^>]*>([^<]*)<\/rdf:li>/g)].map((m) => m[1].trim());
    return (items.length ? items : [block.replace(/<[^>]+>/g, '').trim()]).filter(Boolean);
}

/** Lists what a PDF carries besides its visible pages. `bytes` are the original file bytes. */
export function scanDocument(doc: PDFDocument, bytes: Uint8Array): PrivacyScan {
    const { catalog, context } = doc;
    const raw = new TextDecoder('latin1').decode(bytes);
    const scan: PrivacyScan = {
        pages: doc.getPageCount(),
        info: [],
        xmp: { streams: 0, people: [], tools: [], historySteps: 0 },
        appData: 0,
        attachments: [],
        scripts: 0,
        launches: 0,
        openAction: false,
        fields: { total: 0, filled: 0 },
        comments: { count: 0, authors: [] },
        links: [],
        submitTargets: [],
        earlierVersions: countEof(raw) > 1,
    };

    for (const [key, entry] of findInfo(doc, raw)?.entries() ?? []) {
        const value = text(context.lookup(entry));
        if (!value) continue;
        const k = key.decodeText();
        scan.info.push({ label: INFO_LABELS[k] ?? k, value: k.endsWith('Date') ? formatDate(value) : value });
    }

    const people = new Set<string>();
    const tools = new Set<string>();
    const links = new Set<string>();
    const submits = new Set<string>();
    visitDicts(doc, (dict) => {
        const meta = dict.get(name('Metadata'));
        if (meta) {
            scan.xmp.streams++;
            const xml = readXmp(context.lookup(meta));
            for (const p of xmpValues(xml, 'dc:creator')) people.add(p);
            for (const t of [...xmpValues(xml, 'xmp:CreatorTool'), ...xmpValues(xml, 'pdf:Producer')]) tools.add(t);
            scan.xmp.historySteps += xml.match(/<xmpMM:History[\s\S]*?<\/xmpMM:History>/)?.[0].match(/<rdf:li/g)?.length ?? 0;
        }
        if (dict.has(name('PieceInfo'))) scan.appData++;
        const kind = pick(dict.lookup(name('S')), PDFName)?.decodeText();
        if (kind === 'JavaScript' || (!kind && dict.has(name('JS')))) scan.scripts++;
        if (kind === 'Launch') scan.launches++;
        if (kind === 'SubmitForm') {
            const target = dict.lookup(name('F'));
            const url = target instanceof PDFDict ? text(target.lookup(name('F'))) : text(target);
            if (url) submits.add(url);
        }
    });
    scan.xmp.people = [...people];
    scan.xmp.tools = [...tools];
    scan.submitTargets = [...submits];

    const openAction = catalog.lookup(name('OpenAction'));
    scan.openAction = openAction instanceof PDFDict || catalog.has(name('AA'));

    const names = pick(catalog.lookup(name('Names')), PDFDict);
    for (const [key, spec] of nameTree(doc, pick(names?.lookup(name('EmbeddedFiles')), PDFDict))) {
        const fileSpec = pick(context.lookup(spec), PDFDict);
        const label = text(fileSpec?.lookup(name('UF'))) || text(fileSpec?.lookup(name('F'))) || key || 'Unnamed file';
        const stream = pick(pick(fileSpec?.lookup(name('EF')), PDFDict)?.lookup(name('F')), PDFStream);
        const params = pick(stream?.dict.lookup(name('Params')), PDFDict);
        const size = params?.lookup(name('Size'));
        scan.attachments.push({ name: label, size: size ? Number(size.toString()) : undefined });
    }

    const authors = new Set<string>();
    for (const annot of annotations(doc)) {
        const type = subtype(annot);
        if (type === 'FileAttachment') {
            const spec = pick(annot.lookup(name('FS')), PDFDict);
            scan.attachments.push({ name: text(spec?.lookup(name('UF'))) || text(spec?.lookup(name('F'))) || 'File in a comment' });
        } else if (type === 'Link') {
            const action = pick(annot.lookup(name('A')), PDFDict);
            const uri = action && text(action.lookup(name('URI')));
            if (uri) links.add(uri);
        } else if (COMMENT_TYPES.has(type) && type !== 'Popup') {
            scan.comments.count++;
            const author = text(annot.lookup(name('T')));
            if (author) authors.add(author);
        }
    }
    scan.comments.authors = [...authors];
    scan.links = [...links];

    if (catalog.has(name('AcroForm'))) {
        try {
            for (const field of doc.getForm().getFields()) {
                scan.fields.total++;
                try {
                    const filled =
                        (field instanceof PDFTextField && !!field.getText()) ||
                        (field instanceof PDFCheckBox && field.isChecked()) ||
                        ((field instanceof PDFDropdown || field instanceof PDFOptionList) && field.getSelected().length > 0) ||
                        (field instanceof PDFRadioGroup && !!field.getSelected());
                    if (filled) scan.fields.filled++;
                } catch {}
            }
        } catch (e) {
            console.warn('pdf-privacy-check: could not read form', e);
        }
    }

    return scan;
}

function stripRiskyActions(doc: PDFDocument) {
    const { context } = doc;
    visitDicts(doc, (dict) => {
        dict.delete(name('AA'));
        dict.delete(name('Metadata'));
        dict.delete(name('PieceInfo'));
        for (const [key, value] of dict.entries()) {
            const target = pick(context.lookup(value), PDFDict);
            if (target && target !== dict && isRisky(target)) dict.delete(key);
        }
    });
    for (const [, obj] of context.enumerateIndirectObjects()) {
        if (!(obj instanceof PDFArray)) continue;
        for (let i = obj.size() - 1; i >= 0; i--) {
            const target = pick(context.lookup(obj.get(i)), PDFDict);
            if (target && isRisky(target)) obj.remove(i);
        }
    }
}

function removeUnreachable(doc: PDFDocument) {
    const { context } = doc;
    const seen = new Set<string>();
    const stack: PDFObject[] = [context.trailerInfo.Root, context.trailerInfo.Info].filter(
        (o): o is PDFObject => !!o
    );
    while (stack.length) {
        const obj = stack.pop() as PDFObject;
        if (obj instanceof PDFRef) {
            const key = obj.toString();
            if (seen.has(key)) continue;
            seen.add(key);
            const target = context.lookup(obj);
            if (target) stack.push(target);
            continue;
        }
        stack.push(...children(obj));
    }
    for (const [ref] of context.enumerateIndirectObjects()) {
        if (!seen.has(ref.toString())) context.delete(ref);
    }
}

/** Removes metadata, attachments, scripts and app data, and optionally comments, then drops orphaned objects. */
export function cleanDocument(doc: PDFDocument, options: CleanOptions) {
    const { catalog, context } = doc;
    context.trailerInfo.Info = undefined;
    if (catalog.lookup(name('OpenAction')) instanceof PDFDict) catalog.delete(name('OpenAction'));
    catalog.delete(name('AF'));
    catalog.delete(name('Collection'));

    const names = pick(catalog.lookup(name('Names')), PDFDict);
    if (names) {
        names.delete(name('EmbeddedFiles'));
        names.delete(name('JavaScript'));
        if (names.keys().length === 0) catalog.delete(name('Names'));
    }

    stripRiskyActions(doc);

    for (const page of doc.getPages()) {
        page.node.delete(name('AF'));
        const annots = page.node.Annots();
        if (!annots) continue;
        const keep = annots.asArray().filter((entry) => {
            const annot = pick(context.lookup(entry), PDFDict);
            if (!annot) return true;
            const type = subtype(annot);
            if (type === 'FileAttachment') return false;
            return !(options.comments && COMMENT_TYPES.has(type));
        });
        if (keep.length === 0) page.node.delete(name('Annots'));
        else page.node.set(name('Annots'), context.obj(keep));
    }

    removeUnreachable(doc);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Turns a scan into plain-language findings, most serious first. */
export function buildFindings(scan: PrivacyScan): Finding[] {
    const findings: Finding[] = [];

    if (scan.attachments.length > 0) {
        findings.push({
            id: 'attachments',
            severity: 'high',
            title: `${plural(scan.attachments.length, 'attached file')} inside`,
            detail: 'Other files are tucked inside this PDF. Anyone you send it to can open them.',
            items: scan.attachments.map((a) => a.name),
            handling: 'removed',
        });
    }

    const actionCount = scan.scripts + scan.launches;
    if (actionCount > 0 || scan.openAction) {
        const parts = [
            scan.scripts > 0 ? plural(scan.scripts, 'script') : '',
            scan.launches > 0 ? plural(scan.launches, 'command that opens another program') : '',
            scan.openAction ? 'something that runs when the file opens' : '',
        ].filter(Boolean);
        findings.push({
            id: 'scripts',
            severity: 'high',
            title: 'Code that can run on its own',
            detail: 'Scripts can track when the file is opened or change what it shows. Most shared documents never need them.',
            items: parts,
            handling: 'removed',
        });
    }

    if (scan.info.length > 0) {
        const personal = scan.info.some((i) => i.label === 'Author') || scan.info.some((i) => !Object.values(INFO_LABELS).includes(i.label));
        findings.push({
            id: 'info',
            severity: personal ? 'medium' : 'low',
            title: 'Document details',
            detail: 'Names, dates and the apps used to make the file. Most viewers show these under file properties.',
            items: scan.info.map((i) => `${i.label}: ${i.value}`),
            handling: 'removed',
        });
    }

    if (scan.xmp.streams > 0) {
        const items = [
            ...scan.xmp.people.map((p) => `Person: ${p}`),
            ...scan.xmp.tools.map((t) => `App: ${t}`),
            scan.xmp.historySteps > 0 ? `Editing history: ${plural(scan.xmp.historySteps, 'step')}` : '',
        ].filter(Boolean);
        findings.push({
            id: 'xmp',
            severity: scan.xmp.people.length > 0 || scan.xmp.historySteps > 0 ? 'medium' : 'low',
            title: 'Hidden metadata',
            detail: 'A second, hidden copy of document details. It can repeat names and keep a history of edits.',
            items: items.length ? items : [plural(scan.xmp.streams, 'metadata block')],
            handling: 'removed',
        });
    }

    if (scan.appData > 0) {
        findings.push({
            id: 'app-data',
            severity: 'medium',
            title: 'Private data from the app that made it',
            detail: 'Some design apps store their own editing data in the PDF, sometimes including the original artwork.',
            items: [plural(scan.appData, 'place')],
            handling: 'removed',
        });
    }

    if (scan.earlierVersions) {
        findings.push({
            id: 'versions',
            severity: 'medium',
            title: 'Earlier versions may be inside',
            detail: 'This file was saved on top of an older copy. Deleted text or pages can sometimes be recovered from it.',
            items: [],
            handling: 'removed',
        });
    }

    if (scan.comments.count > 0) {
        findings.push({
            id: 'comments',
            severity: scan.comments.authors.length > 0 ? 'medium' : 'low',
            title: plural(scan.comments.count, 'comment'),
            detail: 'Notes, highlights and drawings, often with the name of the person who added them.',
            items: scan.comments.authors.map((a) => `By ${a}`),
            handling: 'optional',
        });
    }

    if (scan.fields.total > 0) {
        findings.push({
            id: 'fields',
            severity: scan.fields.filled > 0 ? 'medium' : 'low',
            title: plural(scan.fields.total, 'form field'),
            detail:
                scan.fields.filled > 0
                    ? `${scan.fields.filled} filled in. Check that the answers are ones you mean to share.`
                    : 'All empty. Fields are kept so the form still works.',
            items: [],
            handling: 'kept',
        });
    }

    if (scan.submitTargets.length > 0) {
        findings.push({
            id: 'submit',
            severity: 'low',
            title: 'Form sends answers to a web address',
            detail: 'A button in this form can send what was typed to the address below. It is kept so the form still works.',
            items: scan.submitTargets,
            handling: 'kept',
        });
    }

    if (scan.links.length > 0) {
        findings.push({
            id: 'links',
            severity: 'low',
            title: plural(scan.links.length, 'website link'),
            detail: 'Links are kept. Check them for tracking codes or private addresses.',
            items: scan.links,
            handling: 'kept',
        });
    }

    return findings;
}
