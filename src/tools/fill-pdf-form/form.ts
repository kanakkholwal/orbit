import {
  PDFButton,
  PDFCheckBox,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFDropdown,
  type PDFField,
  PDFName,
  PDFOptionList,
  PDFRadioGroup,
  PDFSignature,
  PDFTextField,
  StandardFonts,
} from "pdf-lib";

export type FieldKind = "text" | "multiline" | "checkbox" | "radio" | "dropdown" | "optionlist";

export type FieldValue = string | boolean | string[];

/** Where one widget of a field sits, in PDF points on its page. */
export interface WidgetBox {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  option?: string;
}

/** A fillable field with its current value and where it appears. */
export interface FormFieldInfo {
  name: string;
  label: string;
  kind: FieldKind;
  value: FieldValue;
  options: string[];
  readOnly: boolean;
  required: boolean;
  maxLength?: number;
  multiSelect: boolean;
  editable: boolean;
  pageIndex: number;
  widgets: WidgetBox[];
}

/** Everything the tool needs to know about a document's form. */
export interface FormSummary {
  fields: FormFieldInfo[];
  hasXfa: boolean;
  skipped: { signatures: number; buttons: number };
}

function kindOf(field: PDFField): FieldKind | null {
  if (field instanceof PDFTextField) return field.isMultiline() ? "multiline" : "text";
  if (field instanceof PDFCheckBox) return "checkbox";
  if (field instanceof PDFRadioGroup) return "radio";
  if (field instanceof PDFDropdown) return "dropdown";
  if (field instanceof PDFOptionList) return "optionlist";
  return null;
}

function readValue(field: PDFField): FieldValue {
  try {
    if (field instanceof PDFTextField) return field.getText() ?? "";
    if (field instanceof PDFCheckBox) return field.isChecked();
    if (field instanceof PDFRadioGroup) return field.getSelected() ?? "";
    if (field instanceof PDFDropdown) return field.getSelected();
    if (field instanceof PDFOptionList) return field.getSelected();
  } catch {
    return "";
  }
  return "";
}

function readOptions(field: PDFField): string[] {
  try {
    if (field instanceof PDFRadioGroup || field instanceof PDFDropdown || field instanceof PDFOptionList) {
      return [...new Set(field.getOptions())];
    }
  } catch {
    return [];
  }
  return [];
}

/** Turns "form1[0].page1[0].first_name[0]" into "First name". */
export function friendlyLabel(name: string): string {
  const last = name.split(".").pop() ?? name;
  const cleaned = last
    .replace(/\[\d+\]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return name;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function widgetPages(doc: PDFDocument): Map<string, number> {
  const map = new Map<string, number>();
  doc.getPages().forEach((page, index) => {
    const annots = page.node.Annots();
    if (!annots) return;
    for (let i = 0; i < annots.size(); i++) {
      const ref = annots.get(i);
      map.set(ref.toString(), index);
    }
  });
  return map;
}

/** Reads every fillable field, its value, options and widget rectangles. */
export function readForm(doc: PDFDocument): FormSummary {
  const hasXfa = doc.catalog.lookupMaybe(PDFName.of("AcroForm"), PDFDict)?.has(PDFName.of("XFA")) ?? false;
  const form = doc.getForm();
  const pages = doc.getPages();
  const pageByRef = new Map(pages.map((page, index) => [page.ref.toString(), index]));
  const annotPages = widgetPages(doc);
  const fields: FormFieldInfo[] = [];
  const skipped = { signatures: 0, buttons: 0 };

  for (const field of form.getFields()) {
    if (field instanceof PDFSignature) {
      skipped.signatures++;
      continue;
    }
    if (field instanceof PDFButton) {
      skipped.buttons++;
      continue;
    }
    const kind = kindOf(field);
    if (!kind) continue;

    const widgets: WidgetBox[] = [];
    const exportValues = field instanceof PDFRadioGroup ? field.acroField.getExportValues() : undefined;
    field.acroField.getWidgets().forEach((widget, widgetIndex) => {
      const pageRef = widget.P();
      let pageIndex = pageRef ? pageByRef.get(pageRef.toString()) : undefined;
      if (pageIndex === undefined) {
        const widgetRef = doc.context.getObjectRef(widget.dict);
        if (widgetRef) pageIndex = annotPages.get(widgetRef.toString());
      }
      if (pageIndex === undefined) return;
      const rect = widget.getRectangle();
      const onValue = kind === "radio" ? widget.getOnValue() : undefined;
      const option = exportValues?.[widgetIndex]?.decodeText() ?? (onValue instanceof PDFName ? onValue.decodeText() : undefined);
      widgets.push({
        pageIndex,
        x: Math.min(rect.x, rect.x + rect.width),
        y: Math.min(rect.y, rect.y + rect.height),
        width: Math.abs(rect.width),
        height: Math.abs(rect.height),
        option,
      });
    });

    const name = field.getName();
    fields.push({
      name,
      label: friendlyLabel(name),
      kind,
      value: readValue(field),
      options: readOptions(field),
      readOnly: field.isReadOnly(),
      required: field.isRequired(),
      maxLength: field instanceof PDFTextField ? field.getMaxLength() : undefined,
      multiSelect: field instanceof PDFOptionList || field instanceof PDFDropdown ? field.isMultiselect() : false,
      editable: field instanceof PDFDropdown ? field.isEditable() : false,
      pageIndex: widgets.length > 0 ? Math.min(...widgets.map((w) => w.pageIndex)) : -1,
      widgets,
    });
  }

  fields.sort((a, b) => {
    const pa = a.pageIndex < 0 ? Number.MAX_SAFE_INTEGER : a.pageIndex;
    const pb = b.pageIndex < 0 ? Number.MAX_SAFE_INTEGER : b.pageIndex;
    if (pa !== pb) return pa - pb;
    const wa = a.widgets[0];
    const wb = b.widgets[0];
    if (!wa || !wb) return 0;
    const rowA = wa.y + wa.height;
    const rowB = wb.y + wb.height;
    if (Math.abs(rowA - rowB) > 4) return rowB - rowA;
    return wa.x - wb.x;
  });

  return { fields, hasXfa, skipped };
}

function sameValue(a: FieldValue, b: FieldValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => v === b[i]);
  return a === b;
}

/** Characters in `value` that the built-in Helvetica font can't draw. */
export function unsupportedCharacters(value: string, supported: Set<number>): string[] {
  const bad = new Set<string>();
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (char === "\n" || char === "\r" || char === "\t") continue;
    if (!supported.has(code)) bad.add(char);
  }
  return [...bad];
}

function changedEntries(original: Record<string, FieldValue>, values: Record<string, FieldValue>) {
  return Object.entries(values).filter(([name, value]) => !(name in original && sameValue(original[name], value)));
}

/** Code points the built-in Helvetica font can draw. */
export async function standardCharacterSet(): Promise<Set<number>> {
  const scratch = await PDFDocument.create();
  const font = await scratch.embedFont(StandardFonts.Helvetica);
  return new Set(font.getCharacterSet());
}

/** Changed fields whose text the standard font can't draw, with the offending characters. */
export function findUnsupportedText(
  original: Record<string, FieldValue>,
  values: Record<string, FieldValue>,
  supported: Set<number>
): { name: string; chars: string[] }[] {
  const problems: { name: string; chars: string[] }[] = [];
  for (const [name, value] of changedEntries(original, values)) {
    const texts = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
    const chars = [...new Set(texts.flatMap((t) => unsupportedCharacters(t, supported)))];
    if (chars.length > 0) problems.push({ name, chars });
  }
  return problems;
}

/** Number of fields whose value differs from the original. */
export function countChanges(original: Record<string, FieldValue>, values: Record<string, FieldValue>): number {
  return changedEntries(original, values).length;
}

function writeValue(field: PDFField, value: FieldValue): boolean {
  if (field instanceof PDFTextField && typeof value === "string") {
    const max = field.getMaxLength();
    field.setText(max !== undefined ? value.slice(0, max) : value);
  } else if (field instanceof PDFCheckBox && typeof value === "boolean") {
    if (value) field.check();
    else field.uncheck();
  } else if (field instanceof PDFRadioGroup && typeof value === "string") {
    if (value) field.select(value);
    else field.clear();
  } else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
    const list = (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === "string" && v !== "");
    if (list.length === 0) field.clear();
    else field.select(list);
  } else {
    return false;
  }
  return true;
}

/** Writes changed values into the form, redraws them with Helvetica, and optionally flattens. */
export async function fillForm(
  doc: PDFDocument,
  original: Record<string, FieldValue>,
  values: Record<string, FieldValue>,
  options: { flatten: boolean }
): Promise<{ changed: number; notRedrawn: string[] }> {
  const form = doc.getForm();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let changed = 0;

  for (const [name, value] of changedEntries(original, values)) {
    const field = form.getFieldMaybe(name);
    if (!field || field.isReadOnly()) continue;
    if (writeValue(field, value)) changed++;
  }

  const notRedrawn: string[] = [];
  for (const field of form.getFields()) {
    if (field instanceof PDFSignature || field instanceof PDFButton) continue;
    try {
      if (field.needsAppearancesUpdate()) field.defaultUpdateAppearances(font);
    } catch {
      notRedrawn.push(field.getName());
    }
  }

  if (notRedrawn.length > 0 && !options.flatten) {
    form.acroForm.dict.set(PDFName.of("NeedAppearances"), PDFBool.True);
  }
  if (options.flatten) {
    if (notRedrawn.length > 0) {
      throw new Error(`Some fields can't be drawn flat: ${notRedrawn.map(friendlyLabel).join(", ")}`);
    }
    form.flatten({ updateFieldAppearances: false });
  }
  return { changed, notRedrawn };
}
