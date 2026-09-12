import {
    PDFArray,
    PDFBool,
    PDFDict,
    type PDFDocument,
    PDFName,
    PDFNumber,
    PDFObject,
    PDFOperator,
    PDFOperatorNames,
    type PDFPage,
    PDFRef,
    PDFStream,
} from 'pdf-lib';

export interface FlattenOptions {
    forms: boolean;
    comments: boolean;
    removeLeftovers: boolean;
}

export interface FlattenReport {
    fields: number;
    comments: number;
    removed: number;
    kept: number;
}

const MARKUP = new Set([
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
    'Watermark',
]);

const HIDDEN_FLAG = 1 << 1;
const NO_VIEW_FLAG = 1 << 5;

const pick = <T>(value: PDFObject | undefined, type: { prototype: T }): T | undefined =>
    value instanceof (type as unknown as typeof PDFObject) ? (value as T) : undefined;

const subtypeOf =(doc: PDFDocument, entry: PDFObject | undefined) =>
    pick(pick(doc.context.lookup(entry), PDFDict)?.lookup(PDFName.of('Subtype')), PDFName)?.decodeText() ?? '';

function numbers(arr: PDFArray | undefined, count: number): number[] | undefined {
    if (!arr || arr.size() < count) return undefined;
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
        const n = arr.lookup(i);
        if (!(n instanceof PDFNumber)) return undefined;
        out.push(n.asNumber());
    }
    return out;
}

function normalAppearance(annot: PDFDict): { ref?: PDFRef; stream: PDFStream } | undefined {
    const ap = pick(annot.lookup(PDFName.of('AP')), PDFDict);
    if (!ap) return undefined;
    let entry = ap.get(PDFName.of('N'));
    let resolved = entry && annot.context.lookup(entry);
    if (resolved instanceof PDFDict) {
        const state = pick(annot.lookup(PDFName.of('AS')), PDFName) ?? PDFName.of('Off');
        entry = resolved.get(state);
        resolved = entry && annot.context.lookup(entry);
    }
    if (!(resolved instanceof PDFStream)) return undefined;
    return { ref: entry instanceof PDFRef ? entry : undefined, stream: resolved };
}

function placement(annot: PDFDict, stream: PDFStream): number[] | undefined {
    const rect = numbers(pick(annot.lookup(PDFName.of('Rect')), PDFArray), 4);
    const bbox = numbers(pick(stream.dict.lookup(PDFName.of('BBox')), PDFArray), 4);
    if (!rect || !bbox) return undefined;
    const [a, b, c, d, e, f] = numbers(pick(stream.dict.lookup(PDFName.of('Matrix')), PDFArray), 6) ?? [1, 0, 0, 1, 0, 0];
    const corners = [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[1]],
        [bbox[0], bbox[3]],
        [bbox[2], bbox[3]],
    ].map(([x, y]) => [a * x + c * y + e, b * x + d * y + f]);
    const xs = corners.map((p) => p[0]);
    const ys = corners.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const boxW = Math.max(...xs) - minX;
    const boxH = Math.max(...ys) - minY;
    const rw = Math.abs(rect[2] - rect[0]);
    const rh = Math.abs(rect[3] - rect[1]);
    if (boxW <= 0 || boxH <= 0 || rw <= 0 || rh <= 0) return undefined;
    const sx = rw / boxW;
    const sy = rh / boxH;
    return [sx, 0, 0, sy, Math.min(rect[0], rect[2]) - minX * sx, Math.min(rect[1], rect[3]) - minY * sy];
}

function wrapExistingContent(page: PDFPage, doc: PDFDocument) {
    const { context } = doc;
    const start = context.register(context.contentStream([PDFOperator.of(PDFOperatorNames.PushGraphicsState)]));
    const end = context.register(context.contentStream([PDFOperator.of(PDFOperatorNames.PopGraphicsState)]));
    page.node.wrapContentStreams(start, end);
}

function drawAppearance(page: PDFPage, doc: PDFDocument, annot: PDFDict): boolean {
    const flags = pick(annot.lookup(PDFName.of('F')), PDFNumber)?.asNumber() ?? 0;
    if (flags & (HIDDEN_FLAG | NO_VIEW_FLAG)) return true;
    const appearance = normalAppearance(annot);
    if (!appearance) return false;
    const matrix = placement(annot, appearance.stream);
    if (!matrix) return false;
    const { dict } = appearance.stream;
    dict.set(PDFName.of('Type'), PDFName.of('XObject'));
    dict.set(PDFName.of('Subtype'), PDFName.of('Form'));
    const ref = appearance.ref ?? doc.context.register(appearance.stream);
    const name = page.node.newXObject('Flat', ref);
    page.pushOperators(
        PDFOperator.of(PDFOperatorNames.PushGraphicsState),
        PDFOperator.of(
            PDFOperatorNames.ConcatTransformationMatrix,
            matrix.map((n) => PDFNumber.of(n))
        ),
        PDFOperator.of(PDFOperatorNames.DrawObject, [name]),
        PDFOperator.of(PDFOperatorNames.PopGraphicsState)
    );
    return true;
}

function refreshFieldAppearances(doc: PDFDocument) {
    if (!doc.catalog.has(PDFName.of('AcroForm'))) return;
    try {
        const form = doc.getForm();
        const regenerate = pick(form.acroForm.dict.lookup(PDFName.of('NeedAppearances')), PDFBool)?.asBoolean() === true;
        const font = form.getDefaultFont();
        for (const field of form.getFields()) {
            try {
                if (regenerate) form.markFieldAsDirty(field.ref);
                if (field.needsAppearancesUpdate()) field.defaultUpdateAppearances(font);
            } catch (e) {
                console.warn('flatten-pdf: kept the saved look of a field', e);
            }
        }
    } catch (e) {
        console.warn('flatten-pdf: could not read the form', e);
    }
}

/** Draws form fields and comments into the page content and removes them, without rasterizing. */
export function flattenDocument(doc: PDFDocument, options: FlattenOptions): FlattenReport {
    const report: FlattenReport = { fields: 0, comments: 0, removed: 0, kept: 0 };
    if (options.forms) refreshFieldAppearances(doc);

    for (const page of doc.getPages()) {
        const annots = page.node.Annots();
        if (!annots) continue;
        const entries = annots.asArray();
        const keep: PDFObject[] = [];
        const removed = new Set<string>();
        let wrapped = false;

        for (const entry of entries) {
            const annot = pick(doc.context.lookup(entry), PDFDict);
            const subtype = subtypeOf(doc, entry);
            const isField = subtype === 'Widget';
            const target = (isField && options.forms) || (MARKUP.has(subtype) && options.comments);
            if (!annot || !target) {
                keep.push(entry);
                continue;
            }
            if (!wrapped) {
                wrapExistingContent(page, doc);
                wrapped = true;
            }
            const drawn = drawAppearance(page, doc, annot);
            if (!drawn && !options.removeLeftovers) {
                report.kept++;
                keep.push(entry);
                continue;
            }
            if (!drawn) report.removed++;
            else if (isField) report.fields++;
            else report.comments++;
            removed.add(entry.toString());
            const popup = annot.get(PDFName.of('Popup'));
            if (popup instanceof PDFRef) removed.add(popup.toString());
        }

        const survivors = keep.filter((entry) => {
            if (removed.has(entry.toString())) return false;
            if (subtypeOf(doc, entry) !== 'Popup') return true;
            const parent = pick(doc.context.lookup(entry), PDFDict)?.get(PDFName.of('Parent'));
            return !(parent && removed.has(parent.toString()));
        });

        if (survivors.length === entries.length) continue;
        if (survivors.length === 0) page.node.delete(PDFName.of('Annots'));
        else page.node.set(PDFName.of('Annots'), doc.context.obj(survivors));
    }

    if (options.forms) {
        const widgetsLeft = doc
            .getPages()
            .some((page) => (page.node.Annots()?.asArray() ?? []).some((entry) => subtypeOf(doc, entry) === 'Widget'));
        if (!widgetsLeft) doc.catalog.delete(PDFName.of('AcroForm'));
    }

    return report;
}
