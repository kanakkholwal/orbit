import type { Block, BlockPropsMap, BlockType } from "./types";

export type FieldOption = { value: string | number; label: string };

export type RowColumn = { key: string; label: string; kind: "text" | "number" | "check" };

export type Field =
  | { key: string; label: string; kind: "text"; placeholder?: string }
  | { key: string; label: string; kind: "textarea"; placeholder?: string; hint?: string }
  | { key: string; label: string; kind: "number"; min: number; max: number; step?: number; unit?: string }
  | { key: string; label: string; kind: "segmented"; options: FieldOption[] }
  | { key: string; label: string; kind: "select"; options: FieldOption[] }
  | { key: string; label: string; kind: "switch"; hint?: string }
  | { key: string; label: string; kind: "list"; itemLabel: string }
  | { key: string; label: string; kind: "rows"; columns: RowColumn[]; itemLabel: string }
  | { key: string; label: string; kind: "table" }
  | { key: string; label: string; kind: "image" }
  | { key: string; label: string; kind: "signature" };

export type BlockCategory = "text" | "layout" | "business" | "data" | "media";

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  text: "Text",
  layout: "Layout",
  business: "Business",
  data: "Data and charts",
  media: "Media and codes",
};

export interface BlockDefinition<T extends BlockType = BlockType> {
  type: T;
  label: string;
  description: string;
  category: BlockCategory;
  keywords: string[];
  create: () => BlockPropsMap[T];
  fields: Field[];
}

const align: Field = {
  key: "align",
  label: "Alignment",
  kind: "segmented",
  options: [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ],
};

const define = <T extends BlockType>(definition: BlockDefinition<T>) => definition;

export const BLOCKS = {
  title: define({
    type: "title",
    label: "Title",
    description: "Large cover title with eyebrow and subtitle",
    category: "text",
    keywords: ["cover", "hero", "headline"],
    create: () => ({ eyebrow: "Quarterly report", title: "Document title", subtitle: "A short line that explains what this is.", align: "left" }),
    fields: [{ key: "eyebrow", label: "Eyebrow", kind: "text" }, { key: "title", label: "Title", kind: "text" }, { key: "subtitle", label: "Subtitle", kind: "textarea" }, align],
  }),
  heading: define({
    type: "heading",
    label: "Heading",
    description: "Section heading in three sizes",
    category: "text",
    keywords: ["h1", "h2", "h3", "section"],
    create: () => ({ text: "Section heading", level: 2, align: "left" }),
    fields: [
      { key: "text", label: "Text", kind: "text" },
      { key: "level", label: "Size", kind: "segmented", options: [{ value: 1, label: "Large" }, { value: 2, label: "Medium" }, { value: 3, label: "Small" }] },
      align,
    ],
  }),
  paragraph: define({
    type: "paragraph",
    label: "Text",
    description: "Paragraph with **bold** and *italic*",
    category: "text",
    keywords: ["paragraph", "body", "copy"],
    create: () => ({ text: "Write something here. Wrap words in **double asterisks** for bold or *single* for italic.", align: "left", size: "base", muted: false }),
    fields: [
      { key: "text", label: "Text", kind: "textarea", hint: "**bold**, *italic*, {{field}}" },
      { key: "size", label: "Size", kind: "segmented", options: [{ value: "sm", label: "Small" }, { value: "base", label: "Normal" }, { value: "lg", label: "Large" }] },
      align,
      { key: "muted", label: "Muted colour", kind: "switch" },
    ],
  }),
  quote: define({
    type: "quote",
    label: "Quote",
    description: "Pull quote with attribution",
    category: "text",
    keywords: ["testimonial", "blockquote"],
    create: () => ({ text: "Orbit turned a two-hour chore into a five-minute task.", cite: "A happy customer" }),
    fields: [{ key: "text", label: "Quote", kind: "textarea" }, { key: "cite", label: "Attribution", kind: "text" }],
  }),
  bullets: define({
    type: "bullets",
    label: "Bulleted list",
    description: "Unordered list of points",
    category: "text",
    keywords: ["list", "points", "ul"],
    create: () => ({ items: ["First point", "Second point", "Third point"] }),
    fields: [{ key: "items", label: "Items", kind: "list", itemLabel: "Item" }],
  }),
  numbered: define({
    type: "numbered",
    label: "Numbered list",
    description: "Steps in order",
    category: "text",
    keywords: ["steps", "ordered", "ol"],
    create: () => ({ items: ["Do this first", "Then this", "Finish with this"] }),
    fields: [{ key: "items", label: "Steps", kind: "list", itemLabel: "Step" }],
  }),
  checklist: define({
    type: "checklist",
    label: "Checklist",
    description: "Tasks with tick boxes",
    category: "text",
    keywords: ["todo", "tasks", "checkbox"],
    create: () => ({ items: [{ text: "Book the venue", done: true }, { text: "Send invitations", done: false }, { text: "Confirm catering", done: false }] }),
    fields: [{ key: "items", label: "Tasks", kind: "rows", itemLabel: "Task", columns: [{ key: "done", label: "Done", kind: "check" }, { key: "text", label: "Task", kind: "text" }] }],
  }),
  code: define({
    type: "code",
    label: "Code",
    description: "Monospaced snippet",
    category: "text",
    keywords: ["snippet", "mono", "terminal"],
    create: () => ({ code: "const greeting = \"Hello, Orbit\";\nconsole.log(greeting);" }),
    fields: [{ key: "code", label: "Code", kind: "textarea" }],
  }),
  finePrint: define({
    type: "finePrint",
    label: "Fine print",
    description: "Small muted terms or notes",
    category: "text",
    keywords: ["terms", "notes", "disclaimer", "footnote"],
    create: () => ({ text: "Payment is due within 14 days. Thank you for your business." }),
    fields: [{ key: "text", label: "Text", kind: "textarea" }],
  }),
  divider: define({
    type: "divider",
    label: "Divider",
    description: "Horizontal rule",
    category: "layout",
    keywords: ["line", "rule", "hr", "separator"],
    create: () => ({ variant: "line", space: "md" }),
    fields: [
      { key: "variant", label: "Style", kind: "segmented", options: [{ value: "line", label: "Line" }, { value: "dashed", label: "Dashed" }, { value: "accent", label: "Accent" }] },
      { key: "space", label: "Spacing", kind: "segmented", options: [{ value: "sm", label: "Tight" }, { value: "md", label: "Normal" }, { value: "lg", label: "Roomy" }] },
    ],
  }),
  spacer: define({
    type: "spacer",
    label: "Spacer",
    description: "Empty vertical space",
    category: "layout",
    keywords: ["gap", "space", "whitespace"],
    create: () => ({ size: 24 }),
    fields: [{ key: "size", label: "Height", kind: "number", min: 4, max: 200, step: 4, unit: "pt" }],
  }),
  pageBreak: define({
    type: "pageBreak",
    label: "Page break",
    description: "Start a new page",
    category: "layout",
    keywords: ["new page", "break"],
    create: () => ({}),
    fields: [],
  }),
  columns: define({
    type: "columns",
    label: "Two columns",
    description: "Side-by-side text",
    category: "layout",
    keywords: ["columns", "side by side", "split"],
    create: () => ({ left: "Left column text.", right: "Right column text.", ratio: "1:1" }),
    fields: [
      { key: "left", label: "Left", kind: "textarea" },
      { key: "right", label: "Right", kind: "textarea" },
      { key: "ratio", label: "Widths", kind: "segmented", options: [{ value: "1:1", label: "Equal" }, { value: "2:1", label: "Wide left" }, { value: "1:2", label: "Wide right" }] },
    ],
  }),
  card: define({
    type: "card",
    label: "Card",
    description: "Boxed title and body",
    category: "layout",
    keywords: ["box", "panel", "section"],
    create: () => ({ title: "Card title", body: "Supporting text that sits inside a box.", variant: "muted" }),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "variant", label: "Style", kind: "segmented", options: [{ value: "muted", label: "Filled" }, { value: "outline", label: "Outline" }, { value: "accent", label: "Accent" }] },
    ],
  }),
  callout: define({
    type: "callout",
    label: "Callout",
    description: "Highlighted note, tip or warning",
    category: "layout",
    keywords: ["alert", "note", "warning", "tip", "info"],
    create: () => ({ title: "Good to know", body: "Use callouts for anything readers must not miss.", tone: "info" }),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      {
        key: "tone",
        label: "Tone",
        kind: "select",
        options: [
          { value: "neutral", label: "Brand" },
          { value: "info", label: "Info" },
          { value: "success", label: "Success" },
          { value: "warning", label: "Warning" },
          { value: "danger", label: "Danger" },
        ],
      },
    ],
  }),
  letterhead: define({
    type: "letterhead",
    label: "Letterhead",
    description: "Brand name, logo and contact details",
    category: "business",
    keywords: ["header", "brand", "company", "logo"],
    create: () => ({ brand: "{{company}}", tagline: "Design studio", details: "hello@example.com\n+1 555 0100\nexample.com", logo: "" }),
    fields: [
      { key: "brand", label: "Name", kind: "text" },
      { key: "tagline", label: "Tagline", kind: "text" },
      { key: "details", label: "Details", kind: "textarea", hint: "One per line, shown on the right" },
      { key: "logo", label: "Logo", kind: "image" },
    ],
  }),
  addresses: define({
    type: "addresses",
    label: "From and to",
    description: "Sender and recipient side by side",
    category: "business",
    keywords: ["address", "bill to", "client", "recipient"],
    create: () => ({ fromLabel: "From", from: "{{company}}\n12 Market Street\nLisbon, Portugal", toLabel: "Bill to", to: "{{client}}\n400 Harbour Road\nSydney, Australia" }),
    fields: [
      { key: "fromLabel", label: "Left label", kind: "text" },
      { key: "from", label: "Left", kind: "textarea" },
      { key: "toLabel", label: "Right label", kind: "text" },
      { key: "to", label: "Right", kind: "textarea" },
    ],
  }),
  table: define({
    type: "table",
    label: "Table",
    description: "Rows and columns that split across pages",
    category: "business",
    keywords: ["grid", "line items", "spreadsheet"],
    create: () => ({ columns: ["Item", "Qty", "Price", "Amount"], rows: [["Brand identity", "1", "$2,400", "$2,400"], ["Website design", "1", "$4,800", "$4,800"], ["Print collateral", "3", "$350", "$1,050"]], striped: true, numericLast: true }),
    fields: [
      { key: "table", label: "Cells", kind: "table" },
      { key: "striped", label: "Striped rows", kind: "switch" },
      { key: "numericLast", label: "Right-align numbers", kind: "switch", hint: "Every column after the first" },
    ],
  }),
  keyValue: define({
    type: "keyValue",
    label: "Details",
    description: "Label and value pairs",
    category: "business",
    keywords: ["key value", "metadata", "properties", "info"],
    create: () => ({ items: [{ label: "Invoice", value: "#{{number}}" }, { label: "Issued", value: "{{date}}" }, { label: "Due", value: "{{due}}" }], columns: 1 }),
    fields: [
      { key: "items", label: "Pairs", kind: "rows", itemLabel: "Pair", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "Value", kind: "text" }] },
      { key: "columns", label: "Layout", kind: "segmented", options: [{ value: 1, label: "Stacked" }, { value: 2, label: "Two columns" }] },
    ],
  }),
  totals: define({
    type: "totals",
    label: "Totals",
    description: "Subtotal, tax and grand total",
    category: "business",
    keywords: ["sum", "invoice", "tax", "subtotal", "price"],
    create: () => ({ items: [{ label: "Subtotal", value: "$8,250" }, { label: "Tax (20%)", value: "$1,650" }], totalLabel: "Total due", total: "$9,900" }),
    fields: [
      { key: "items", label: "Lines", kind: "rows", itemLabel: "Line", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "Amount", kind: "text" }] },
      { key: "totalLabel", label: "Total label", kind: "text" },
      { key: "total", label: "Total", kind: "text" },
    ],
  }),
  signature: define({
    type: "signature",
    label: "Signatures",
    description: "Signature lines with names",
    category: "business",
    keywords: ["sign", "approval", "agreement"],
    create: () => ({ parties: [{ name: "{{company}}", role: "Provider" }, { name: "{{client}}", role: "Client" }], showDate: true, image: "" }),
    fields: [
      { key: "parties", label: "Signers", kind: "rows", itemLabel: "Signer", columns: [{ key: "name", label: "Name", kind: "text" }, { key: "role", label: "Role", kind: "text" }] },
      { key: "showDate", label: "Date line", kind: "switch" },
      { key: "image", label: "First signature", kind: "signature" },
    ],
  }),
  stats: define({
    type: "stats",
    label: "Key numbers",
    description: "Big metrics in tiles",
    category: "data",
    keywords: ["kpi", "metrics", "numbers", "stats"],
    create: () => ({ items: [{ label: "Revenue", value: "$1.2M", note: "+18% vs Q2" }, { label: "Customers", value: "3,480", note: "+412 new" }, { label: "Churn", value: "1.9%", note: "-0.4 pts" }] }),
    fields: [{ key: "items", label: "Tiles", kind: "rows", itemLabel: "Tile", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "Value", kind: "text" }, { key: "note", label: "Note", kind: "text" }] }],
  }),
  progress: define({
    type: "progress",
    label: "Progress bars",
    description: "Percentages as bars",
    category: "data",
    keywords: ["skills", "goals", "percent", "completion"],
    create: () => ({ items: [{ label: "Design", value: 90 }, { label: "Build", value: 65 }, { label: "Launch", value: 20 }] }),
    fields: [{ key: "items", label: "Bars", kind: "rows", itemLabel: "Bar", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "%", kind: "number" }] }],
  }),
  barChart: define({
    type: "barChart",
    label: "Bar chart",
    description: "Compare values side by side",
    category: "data",
    keywords: ["chart", "graph", "bars", "column chart"],
    create: () => ({ title: "Sales by quarter", data: [{ label: "Q1", value: 42 }, { label: "Q2", value: 58 }, { label: "Q3", value: 71 }, { label: "Q4", value: 64 }], showValues: true }),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "data", label: "Bars", kind: "rows", itemLabel: "Bar", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "Value", kind: "number" }] },
      { key: "showValues", label: "Show values", kind: "switch" },
    ],
  }),
  lineChart: define({
    type: "lineChart",
    label: "Line chart",
    description: "A trend over time",
    category: "data",
    keywords: ["trend", "graph", "timeline chart"],
    create: () => ({ title: "Monthly visitors", seriesName: "Visitors", data: [{ label: "Jan", value: 1200 }, { label: "Feb", value: 1850 }, { label: "Mar", value: 1640 }, { label: "Apr", value: 2310 }, { label: "May", value: 2780 }] }),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "seriesName", label: "Series name", kind: "text" },
      { key: "data", label: "Points", kind: "rows", itemLabel: "Point", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "Value", kind: "number" }] },
    ],
  }),
  pieChart: define({
    type: "pieChart",
    label: "Pie chart",
    description: "Parts of a whole",
    category: "data",
    keywords: ["donut", "share", "breakdown"],
    create: () => ({ title: "Budget split", data: [{ label: "Design", value: 40 }, { label: "Engineering", value: 35 }, { label: "Marketing", value: 25 }], donut: true }),
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "data", label: "Slices", kind: "rows", itemLabel: "Slice", columns: [{ key: "label", label: "Label", kind: "text" }, { key: "value", label: "Value", kind: "number" }] },
      { key: "donut", label: "Donut", kind: "switch" },
    ],
  }),
  timeline: define({
    type: "timeline",
    label: "Timeline",
    description: "Dated milestones",
    category: "data",
    keywords: ["milestones", "roadmap", "history", "agenda"],
    create: () => ({ items: [{ date: "Mar 2026", title: "Kick-off", body: "Goals and scope agreed." }, { date: "May 2026", title: "Beta", body: "First customers onboarded." }, { date: "Sep 2026", title: "Launch", body: "Available to everyone." }] }),
    fields: [{ key: "items", label: "Milestones", kind: "rows", itemLabel: "Milestone", columns: [{ key: "date", label: "Date", kind: "text" }, { key: "title", label: "Title", kind: "text" }, { key: "body", label: "Details", kind: "text" }] }],
  }),
  badges: define({
    type: "badges",
    label: "Tags",
    description: "Row of small labels",
    category: "data",
    keywords: ["badges", "chips", "skills", "labels"],
    create: () => ({ items: ["Strategy", "Design", "Research"], variant: "soft" }),
    fields: [
      { key: "items", label: "Tags", kind: "list", itemLabel: "Tag" },
      { key: "variant", label: "Style", kind: "segmented", options: [{ value: "soft", label: "Soft" }, { value: "outline", label: "Outline" }, { value: "solid", label: "Solid" }] },
    ],
  }),
  image: define({
    type: "image",
    label: "Image",
    description: "Photo or logo from your device",
    category: "media",
    keywords: ["photo", "picture", "logo"],
    create: () => ({ src: "", alt: "", width: "half", align: "left", caption: "" }),
    fields: [
      { key: "src", label: "Image", kind: "image" },
      { key: "width", label: "Width", kind: "segmented", options: [{ value: "third", label: "1/3" }, { value: "half", label: "1/2" }, { value: "full", label: "Full" }] },
      align,
      { key: "caption", label: "Caption", kind: "text" },
      { key: "alt", label: "Description", kind: "text", placeholder: "For screen readers" },
    ],
  }),
  qr: define({
    type: "qr",
    label: "QR code",
    description: "Link or text as a QR code",
    category: "media",
    keywords: ["qr", "link", "scan"],
    create: () => ({ data: "https://example.com", size: 88, caption: "Scan to pay", align: "left" }),
    fields: [
      { key: "data", label: "Link or text", kind: "text" },
      { key: "size", label: "Size", kind: "number", min: 48, max: 200, step: 8, unit: "pt" },
      { key: "caption", label: "Caption", kind: "text" },
      align,
    ],
  }),
  barcode: define({
    type: "barcode",
    label: "Barcode",
    description: "Code 128, Code 39 or EAN-13",
    category: "media",
    keywords: ["sku", "shipping", "tracking", "ean"],
    create: () => ({ data: "ORB-2026-0042", format: "Code128", caption: "Order ORB-2026-0042" }),
    fields: [
      { key: "data", label: "Value", kind: "text" },
      { key: "format", label: "Format", kind: "segmented", options: [{ value: "Code128", label: "Code 128" }, { value: "Code39", label: "Code 39" }, { value: "EAN13", label: "EAN-13" }] },
      { key: "caption", label: "Caption", kind: "text" },
    ],
  }),
} satisfies { [K in BlockType]: BlockDefinition<K> };

export const BLOCK_LIST = Object.values(BLOCKS) as BlockDefinition[];

export function getBlockDefinition(type: BlockType): BlockDefinition {
  return BLOCKS[type] as unknown as BlockDefinition;
}

export function createBlock<T extends BlockType>(type: T, props?: Partial<BlockPropsMap[T]>): Block<T> {
  const definition = BLOCKS[type] as unknown as BlockDefinition<T>;
  return { id: crypto.randomUUID(), type, props: { ...definition.create(), ...props } } as Block<T>;
}

/** Shorthand for presets: `b("heading", { text: "Hi" })`. */
export const b = createBlock;
