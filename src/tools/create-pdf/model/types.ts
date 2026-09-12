export type Align = "left" | "center" | "right";
export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export type LabelValue = { label: string; value: string };
export type ChartPoint = { label: string; value: number };

export interface BlockPropsMap {
  title: { eyebrow: string; title: string; subtitle: string; align: Align };
  heading: { text: string; level: 1 | 2 | 3; align: Align };
  paragraph: { text: string; align: Align; size: "sm" | "base" | "lg"; muted: boolean };
  quote: { text: string; cite: string };
  bullets: { items: string[] };
  numbered: { items: string[] };
  checklist: { items: { text: string; done: boolean }[] };
  code: { code: string };
  finePrint: { text: string };
  divider: { variant: "line" | "dashed" | "accent"; space: "sm" | "md" | "lg" };
  spacer: { size: number };
  pageBreak: Record<string, never>;
  columns: { left: string; right: string; ratio: "1:1" | "2:1" | "1:2" };
  card: { title: string; body: string; variant: "muted" | "outline" | "accent" };
  callout: { title: string; body: string; tone: Tone };
  letterhead: { brand: string; tagline: string; details: string; logo: string };
  addresses: { fromLabel: string; from: string; toLabel: string; to: string };
  table: {
    columns: string[];
    rows: string[][];
    striped: boolean;
    numericLast: boolean;
    /** Smaller text and tighter cells, for wide data tables. */
    compact?: boolean;
    /** Relative column widths; defaults to a wider first column. */
    widths?: number[];
  };
  keyValue: { items: LabelValue[]; columns: 1 | 2 };
  totals: { items: LabelValue[]; totalLabel: string; total: string };
  stats: { items: { label: string; value: string; note: string }[] };
  progress: { items: { label: string; value: number }[] };
  barChart: { title: string; data: ChartPoint[]; showValues: boolean };
  lineChart: { title: string; seriesName: string; data: ChartPoint[] };
  pieChart: { title: string; data: ChartPoint[]; donut: boolean };
  timeline: { items: { date: string; title: string; body: string }[] };
  badges: { items: string[]; variant: "soft" | "outline" | "solid" };
  image: { src: string; alt: string; width: "full" | "half" | "third"; align: Align; caption: string };
  qr: { data: string; size: number; caption: string; align: Align };
  barcode: { data: string; format: "Code128" | "Code39" | "EAN13"; caption: string };
  signature: { parties: { name: string; role: string }[]; showDate: boolean; image: string };
}

export type BlockType = keyof BlockPropsMap;

export type Block<T extends BlockType = BlockType> = {
  [K in T]: { id: string; type: K; props: BlockPropsMap[K] };
}[T];

export type PageSize = "A4" | "Letter" | "Legal" | "A5";
export type Margin = "narrow" | "normal" | "wide";

export interface DocSettings {
  size: PageSize;
  orientation: "portrait" | "landscape";
  margin: Margin;
  header: { enabled: boolean; left: string; right: string };
  footer: { enabled: boolean; left: string; pageNumbers: boolean };
  watermark: { enabled: boolean; text: string };
}

export interface CreatorDoc {
  version: 1;
  id: string;
  name: string;
  theme: string;
  /** Overrides the theme's primary colour when set. */
  accent: string | null;
  settings: DocSettings;
  /** Values for `{{field}}` placeholders. */
  data: Record<string, string>;
  blocks: Block[];
  updatedAt: number;
}
