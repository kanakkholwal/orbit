import type { FormeDocument, FormeNode, FormeNodeKind, Style, TextRun } from "@formepdf/shared";
import { buildBarChartKind, buildLineChartKind, buildPieChartKind, mapColumnWidth, mapStyle } from "@formepdf/shared";
import { fill, parseInline } from "./fields";
import { type CreatorTheme, getTheme, MARGIN_POINTS, PDF_FONTS, pageBox, tint, toneColor } from "./themes";
import type { Align, Block, CreatorDoc } from "./types";

type Ctx = {
  theme: CreatorTheme;
  data: Record<string, string>;
  contentWidth: number;
  body: string;
  heading: string;
};

const node = (kind: FormeNodeKind, style: Style = {}, children: FormeNode[] = []): FormeNode => ({
  kind,
  style: mapStyle(style),
  children,
});

const view = (style: Style, children: FormeNode[]) => node({ type: "View" }, style, children);

const alignItems = (align: Align) => (align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start");

function text(ctx: Ctx, value: string, style: Style = {}): FormeNode {
  const filled = fill(value, ctx.data);
  const base: Style = { fontFamily: ctx.body, fontSize: ctx.theme.bodySize, lineHeight: ctx.theme.lineHeight, color: ctx.theme.colors.foreground, ...style };
  const runs = parseInline(filled);
  if (runs.length <= 1 && !runs[0]?.bold && !runs[0]?.italic) {
    return node({ type: "Text", content: filled }, base);
  }
  const textRuns: TextRun[] = runs.map((run) => ({
    content: run.text,
    style: run.bold || run.italic ? mapStyle({ fontWeight: run.bold ? 700 : undefined, fontStyle: run.italic ? "italic" : undefined }) : undefined,
  }));
  return node({ type: "Text", content: "", runs: textRuns }, base);
}

const label = (ctx: Ctx, value: string, style: Style = {}) =>
  text(ctx, value, { fontSize: 7.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: ctx.theme.colors.mutedForeground, ...style });

function lines(ctx: Ctx, value: string, style: Style = {}): FormeNode[] {
  return fill(value, ctx.data)
    .split("\n")
    .map((line) => text(ctx, line || " ", style));
}

function palette(theme: CreatorTheme): string[] {
  const { primary, accent, mutedForeground, info, warning, success } = theme.colors;
  return [primary, accent, tint(primary, 0.55), info, warning, success, mutedForeground, tint(accent, 0.45)];
}

function compileBlock(block: Block, ctx: Ctx): FormeNode | null {
  const { theme } = ctx;
  const { colors } = theme;
  const gap = theme.gap;

  switch (block.type) {
    case "title": {
      const p = block.props;
      const textAlign = p.align;
      return view({ marginBottom: gap * 1.6, alignItems: alignItems(p.align) }, [
        ...(p.eyebrow ? [label(ctx, p.eyebrow, { color: colors.primary, marginBottom: 8, textAlign })] : []),
        text(ctx, p.title, { fontFamily: ctx.heading, fontSize: theme.headingSizes[0] * 1.2, fontWeight: theme.headingWeight, lineHeight: 1.1, textAlign }),
        ...(p.subtitle ? [text(ctx, p.subtitle, { fontSize: theme.bodySize + 2.5, color: colors.mutedForeground, marginTop: 8, textAlign })] : []),
      ]);
    }
    case "heading": {
      const p = block.props;
      return node(
        { type: "Heading", level: p.level, content: fill(p.text, ctx.data) },
        {
          fontFamily: ctx.heading,
          fontSize: theme.headingSizes[p.level - 1],
          fontWeight: theme.headingWeight,
          lineHeight: 1.25,
          color: colors.foreground,
          textAlign: p.align,
          marginTop: p.level === 1 ? 0 : gap * 0.6,
          marginBottom: gap * 0.6,
        }
      );
    }
    case "paragraph": {
      const p = block.props;
      const size = p.size === "sm" ? theme.bodySize - 1.5 : p.size === "lg" ? theme.bodySize + 2 : theme.bodySize;
      return text(ctx, p.text, { fontSize: size, textAlign: p.align, color: p.muted ? colors.mutedForeground : colors.foreground, marginBottom: gap });
    }
    case "quote":
      return view({ borderLeftWidth: 3, borderColor: colors.primary, paddingLeft: 14, paddingVertical: 2, marginBottom: gap }, [
        text(ctx, block.props.text, { fontSize: theme.bodySize + 2, fontStyle: "italic", lineHeight: 1.45 }),
        ...(block.props.cite ? [text(ctx, block.props.cite, { fontSize: theme.bodySize - 1, color: colors.mutedForeground, marginTop: 6 })] : []),
      ]);
    case "bullets":
    case "numbered":
      return node(
        { type: "List", ordered: block.type === "numbered", marker_type: block.type === "numbered" ? "decimal" : "disc", start: 1 },
        { marginBottom: gap, fontFamily: ctx.body, fontSize: theme.bodySize, color: colors.foreground },
        block.props.items.map((item) => node({ type: "ListItem" }, { marginBottom: 3 }, [text(ctx, item)]))
      );
    case "checklist":
      return view(
        { marginBottom: gap },
        block.props.items.map((item) =>
          view({ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 }, [
            view({ width: 10, height: 10, borderWidth: 1, borderColor: item.done ? colors.primary : colors.mutedForeground, borderRadius: 2, backgroundColor: item.done ? colors.primary : "#ffffff" }, []),
            text(ctx, item.text, item.done ? { color: colors.mutedForeground, textDecoration: "line-through" } : {}),
          ])
        )
      );
    case "code":
      return view({ backgroundColor: colors.muted, padding: 12, borderRadius: theme.radius, marginBottom: gap }, [
        node({ type: "Text", content: block.props.code }, { fontFamily: PDF_FONTS.mono, fontSize: theme.bodySize - 1, lineHeight: 1.5, color: colors.foreground }),
      ]);
    case "finePrint":
      return text(ctx, block.props.text, { fontSize: theme.bodySize - 2, color: colors.mutedForeground, lineHeight: 1.5, marginBottom: gap });
    case "divider": {
      const p = block.props;
      const space = p.space === "sm" ? 4 : p.space === "lg" ? 18 : 10;
      const margins: Style = { marginTop: space, marginBottom: space + gap * 0.5 };
      if (p.variant === "dashed") {
        const dashes = Math.floor(ctx.contentWidth / 7);
        return view({ ...margins, flexDirection: "row", gap: 3 }, Array.from({ length: dashes }, () => view({ width: 4, height: 0.75, backgroundColor: colors.border }, [])));
      }
      return view({ ...margins, borderTopWidth: p.variant === "accent" ? 2 : 0.75, borderColor: p.variant === "accent" ? colors.primary : colors.border, width: p.variant === "accent" ? 48 : "100%" }, []);
    }
    case "spacer":
      return view({ height: block.props.size }, []);
    case "pageBreak":
      return node({ type: "PageBreak" });
    case "columns": {
      const [left, right] = block.props.ratio === "2:1" ? [2, 1] : block.props.ratio === "1:2" ? [1, 2] : [1, 1];
      return view({ flexDirection: "row", gap: 18, marginBottom: gap }, [
        view({ flex: left }, lines(ctx, block.props.left)),
        view({ flex: right }, lines(ctx, block.props.right)),
      ]);
    }
    case "card": {
      const p = block.props;
      const style: Style =
        p.variant === "outline"
          ? { borderWidth: 0.75, borderColor: colors.border }
          : p.variant === "accent"
            ? { backgroundColor: tint(colors.primary, 0.08), borderLeftWidth: 3, borderColor: colors.primary }
            : { backgroundColor: colors.muted };
      return view({ padding: 14, borderRadius: theme.radius, marginBottom: gap, ...style }, [
        text(ctx, p.title, { fontFamily: ctx.heading, fontWeight: 700, fontSize: theme.bodySize + 1.5, marginBottom: 4 }),
        text(ctx, p.body, { color: colors.foreground }),
      ]);
    }
    case "callout": {
      const tone = toneColor(theme, block.props.tone);
      return view({ backgroundColor: tint(tone, 0.08), borderLeftWidth: 3, borderColor: tone, borderRadius: theme.radius, padding: 12, marginBottom: gap }, [
        text(ctx, block.props.title, { fontWeight: 700, color: tone, marginBottom: 3 }),
        text(ctx, block.props.body),
      ]);
    }
    case "letterhead": {
      const p = block.props;
      return view({ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 14, borderBottomWidth: 0.75, borderColor: colors.border, marginBottom: gap * 1.6 }, [
        view({ flexDirection: "row", alignItems: "center", gap: 10 }, [
          ...(p.logo ? [node({ type: "Image", src: p.logo, height: 36 }, { height: 36 })] : []),
          view({}, [
            text(ctx, p.brand, { fontFamily: ctx.heading, fontSize: 18, fontWeight: 700, color: colors.primary, lineHeight: 1.2 }),
            ...(p.tagline ? [text(ctx, p.tagline, { fontSize: theme.bodySize - 1, color: colors.mutedForeground })] : []),
          ]),
        ]),
        view({ alignItems: "flex-end" }, lines(ctx, p.details, { fontSize: theme.bodySize - 1, color: colors.mutedForeground, textAlign: "right", lineHeight: 1.45 })),
      ]);
    }
    case "addresses": {
      const p = block.props;
      const column = (title: string, body: string) => view({ flex: 1 }, [label(ctx, title, { marginBottom: 5 }), ...lines(ctx, body, { lineHeight: 1.45 })]);
      return view({ flexDirection: "row", gap: 24, marginBottom: gap * 1.4 }, [column(p.fromLabel, p.from), column(p.toLabel, p.to)]);
    }
    case "table": {
      const p = block.props;
      const count = Math.max(p.columns.length, 1);
      const weights = p.columns.map((_, i) => p.widths?.[i] ?? (i === 0 && count > 2 ? 2 : 1));
      const total = weights.reduce((sum, w) => sum + w, 0);
      const cellAlign = (i: number) => (p.numericLast && i > 0 ? "right" : "left");
      const bodySize = p.compact ? theme.bodySize - 2.5 : theme.bodySize;
      const padding: Style = p.compact ? { paddingVertical: 3.5, paddingHorizontal: 5 } : { paddingVertical: 6, paddingHorizontal: 8 };
      const cell = (value: string, i: number, header: boolean) =>
        node({ type: "TableCell", col_span: 1, row_span: 1 }, padding, [
          text(
            ctx,
            value,
            header
              ? { fontSize: bodySize - 1.5, fontWeight: 700, color: colors.mutedForeground, textAlign: cellAlign(i) }
              : { textAlign: cellAlign(i), ...(p.compact ? { fontSize: bodySize, lineHeight: 1.35 } : {}) }
          ),
        ]);
      return node({ type: "Table", columns: weights.map((w) => ({ width: mapColumnWidth({ fraction: w / total }) })) }, { marginBottom: gap }, [
        node({ type: "TableRow", is_header: true }, { borderBottomWidth: 1, borderColor: colors.foreground }, p.columns.map((c, i) => cell(c, i, true))),
        ...p.rows.map((row, r) =>
          node(
            { type: "TableRow", is_header: false },
            { borderBottomWidth: 0.5, borderColor: colors.border, backgroundColor: p.striped && r % 2 === 1 ? colors.muted : undefined },
            p.columns.map((_, i) => cell(row[i] ?? "", i, false))
          )
        ),
      ]);
    }
    case "keyValue": {
      const p = block.props;
      const pair = (item: { label: string; value: string }) =>
        view({ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 4, borderBottomWidth: 0.5, borderColor: colors.border, width: p.columns === 2 ? "48%" : "100%" }, [
          text(ctx, item.label, { color: colors.mutedForeground }),
          text(ctx, item.value, { fontWeight: 700, textAlign: "right" }),
        ]);
      return view({ flexDirection: p.columns === 2 ? "row" : "column", flexWrap: "wrap", justifyContent: "space-between", marginBottom: gap }, p.items.map(pair));
    }
    case "totals": {
      const p = block.props;
      const row = (l: string, v: string, style: Style = {}) =>
        view({ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }, [text(ctx, l, { color: colors.mutedForeground, ...style }), text(ctx, v, { textAlign: "right", ...style })]);
      return view({ alignItems: "flex-end", marginBottom: gap }, [
        view({ width: 220 }, [
          ...p.items.map((item) => row(item.label, item.value)),
          view({ borderTopWidth: 1, borderColor: colors.foreground, marginTop: 4, paddingTop: 4 }, [
            row(p.totalLabel, p.total, { fontWeight: 700, fontSize: theme.bodySize + 2, color: colors.primary }),
          ]),
        ]),
      ]);
    }
    case "signature": {
      const p = block.props;
      return view(
        { flexDirection: "row", gap: 32, marginTop: gap, marginBottom: gap },
        p.parties.map((party, i) =>
          view({ flex: 1 }, [
            ...(i === 0 && p.image ? [node({ type: "Image", src: p.image, height: 40 }, { height: 40, marginBottom: 2 })] : [view({ height: 42 }, [])]),
            view({ borderTopWidth: 0.75, borderColor: colors.foreground, paddingTop: 5 }, [
              text(ctx, party.name, { fontWeight: 700 }),
              ...(party.role ? [text(ctx, party.role, { fontSize: theme.bodySize - 1, color: colors.mutedForeground })] : []),
              ...(p.showDate ? [text(ctx, "Date", { fontSize: theme.bodySize - 1.5, color: colors.mutedForeground, marginTop: 12 })] : []),
            ]),
          ])
        )
      );
    }
    case "stats":
      return view(
        { flexDirection: "row", gap: 10, marginBottom: gap },
        block.props.items.map((item) =>
          view({ flex: 1, backgroundColor: colors.muted, borderRadius: theme.radius, padding: 12 }, [
            label(ctx, item.label, { marginBottom: 4 }),
            text(ctx, item.value, { fontFamily: ctx.heading, fontSize: 20, fontWeight: 700, lineHeight: 1.15 }),
            ...(item.note ? [text(ctx, item.note, { fontSize: theme.bodySize - 1.5, color: colors.primary, marginTop: 3 })] : []),
          ])
        )
      );
    case "progress":
      return view(
        { marginBottom: gap },
        block.props.items.map((item) => {
          const value = Math.max(0, Math.min(100, Number(item.value) || 0));
          return view({ marginBottom: 8 }, [
            view({ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }, [
              text(ctx, item.label, { fontSize: theme.bodySize - 0.5 }),
              text(ctx, `${value}%`, { fontSize: theme.bodySize - 1, color: colors.mutedForeground }),
            ]),
            view({ height: 5, backgroundColor: colors.muted, borderRadius: 3 }, [view({ height: 5, width: `${value}%`, backgroundColor: colors.primary, borderRadius: 3 }, [])]),
          ]);
        })
      );
    case "barChart": {
      const p = block.props;
      return view({ marginBottom: gap }, [
        ...(p.title ? [text(ctx, p.title, { fontWeight: 700, marginBottom: 6 })] : []),
        node(buildBarChartKind({ width: ctx.contentWidth - 16, height: 170, data: p.data.map((d) => ({ label: fill(d.label, ctx.data), value: Number(d.value) || 0 })), color: colors.primary, showValues: p.showValues, showGrid: true })),
      ]);
    }
    case "lineChart": {
      const p = block.props;
      return view({ marginBottom: gap }, [
        ...(p.title ? [text(ctx, p.title, { fontWeight: 700, marginBottom: 6 })] : []),
        node(
          buildLineChartKind({
            width: ctx.contentWidth - 16,
            height: 170,
            labels: p.data.map((d) => fill(d.label, ctx.data)),
            series: [{ name: p.seriesName || "Series", data: p.data.map((d) => Number(d.value) || 0), color: colors.primary }],
            showPoints: true,
            showGrid: true,
          })
        ),
      ]);
    }
    case "pieChart": {
      const p = block.props;
      const colorsList = palette(theme);
      return view({ marginBottom: gap }, [
        ...(p.title ? [text(ctx, p.title, { fontWeight: 700, marginBottom: 6 })] : []),
        node(
          buildPieChartKind({
            width: Math.min(ctx.contentWidth, 340),
            height: 170,
            donut: p.donut,
            showLegend: true,
            data: p.data.map((d, i) => ({ label: fill(d.label, ctx.data), value: Number(d.value) || 0, color: colorsList[i % colorsList.length] })),
          })
        ),
      ]);
    }
    case "timeline":
      return view(
        { marginBottom: gap },
        block.props.items.map((item, i, all) =>
          view({ flexDirection: "row", gap: 12 }, [
            text(ctx, item.date, { width: 72, fontSize: theme.bodySize - 1, fontWeight: 700, color: colors.mutedForeground }),
            view({ width: 9, alignItems: "center" }, [
              view({ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, marginTop: 3 }, []),
              ...(i < all.length - 1 ? [view({ width: 1, flexGrow: 1, backgroundColor: colors.border, marginTop: 2 }, [])] : []),
            ]),
            view({ flex: 1, paddingBottom: 12 }, [
              text(ctx, item.title, { fontWeight: 700 }),
              ...(item.body ? [text(ctx, item.body, { color: colors.mutedForeground })] : []),
            ]),
          ])
        )
      );
    case "badges": {
      const p = block.props;
      const style: Style =
        p.variant === "solid"
          ? { backgroundColor: colors.primary }
          : p.variant === "outline"
            ? { borderWidth: 0.75, borderColor: colors.primary }
            : { backgroundColor: tint(colors.primary, 0.12) };
      return view(
        { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: gap },
        p.items.map((item) =>
          view({ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, ...style }, [
            text(ctx, item, { fontSize: theme.bodySize - 2, fontWeight: 700, color: p.variant === "solid" ? "#ffffff" : colors.primary, lineHeight: 1.2 }),
          ])
        )
      );
    }
    case "image": {
      const p = block.props;
      if (!p.src) return null;
      const fraction = p.width === "full" ? 1 : p.width === "half" ? 0.5 : 1 / 3;
      const width = Math.round(ctx.contentWidth * fraction);
      const image = node({ type: "Image", src: p.src, width }, { width, borderRadius: theme.radius });
      return view({ alignItems: alignItems(p.align), marginBottom: gap }, [
        image,
        ...(p.caption ? [text(ctx, p.caption, { fontSize: theme.bodySize - 2, color: colors.mutedForeground, marginTop: 4, width, textAlign: p.align })] : []),
      ]);
    }
    case "qr": {
      const p = block.props;
      if (!p.data.trim()) return null;
      return view({ alignItems: alignItems(p.align), marginBottom: gap }, [
        node({ type: "QrCode", data: fill(p.data, ctx.data), size: p.size }, { color: colors.foreground }),
        ...(p.caption ? [text(ctx, p.caption, { fontSize: theme.bodySize - 2, color: colors.mutedForeground, marginTop: 4 })] : []),
      ]);
    }
    case "barcode": {
      const p = block.props;
      if (!p.data.trim()) return null;
      return view({ marginBottom: gap }, [
        node({ type: "Barcode", data: fill(p.data, ctx.data), format: p.format, height: 44 }, { color: colors.foreground }),
        ...(p.caption ? [text(ctx, p.caption, { fontFamily: PDF_FONTS.mono, fontSize: theme.bodySize - 2, color: colors.mutedForeground, marginTop: 4 })] : []),
      ]);
    }
  }
}

const UNBREAKABLE = new Set<Block["type"]>(["title", "quote", "code", "columns", "card", "callout", "letterhead", "addresses", "totals", "signature", "stats", "progress", "barChart", "lineChart", "pieChart", "badges", "image", "qr", "barcode"]);

function isSmall(block: Block): boolean {
  switch (block.type) {
    case "table":
      return block.props.rows.length <= 8;
    case "bullets":
    case "numbered":
    case "checklist":
    case "keyValue":
    case "timeline":
      return block.props.items.length <= 8;
    case "paragraph":
      return block.props.text.length <= 600;
    default:
      return UNBREAKABLE.has(block.type) || block.type === "finePrint" || block.type === "divider";
  }
}

/** Stops cards and charts splitting across pages, and keeps headings with what follows them. */
function keepTogether(blocks: Block[], ctx: Ctx): FormeNode[] {
  const out: FormeNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const compiled = compileBlock(block, ctx);
    if (!compiled) continue;
    if (UNBREAKABLE.has(block.type) || (isSmall(block) && block.type !== "paragraph")) compiled.style.wrap = false;
    const next = blocks[i + 1];
    if ((block.type === "heading" || block.type === "title") && next && isSmall(next)) {
      const following = compileBlock(next, ctx);
      if (following) {
        following.style.wrap = false;
        out.push(view({ wrap: false }, [compiled, following]));
        i++;
        continue;
      }
    }
    out.push(compiled);
  }
  return out;
}

/** Builds the Forme document for a creator document. */
export function compileDocument(doc: CreatorDoc): FormeDocument {
  const theme = getTheme(doc.theme, doc.accent);
  const { settings } = doc;
  const margin = MARGIN_POINTS[settings.margin];
  const box = pageBox(settings.size, settings.orientation);
  const ctx: Ctx = {
    theme,
    data: doc.data,
    contentWidth: box.width - margin * 2,
    body: PDF_FONTS[theme.fonts.body],
    heading: PDF_FONTS[theme.fonts.heading],
  };
  const small: Style = { fontSize: 8, color: theme.colors.mutedForeground, fontFamily: ctx.body };

  const chrome: FormeNode[] = [];
  if (settings.watermark.enabled && settings.watermark.text.trim()) {
    chrome.push(node({ type: "Watermark", text: fill(settings.watermark.text, doc.data), font_size: 72, angle: -40 }, { color: theme.colors.foreground, opacity: 0.06 }));
  }
  if (settings.header.enabled) {
    chrome.push(
      node({ type: "Fixed", position: "Header" }, { paddingBottom: 20 }, [
        view({ flexDirection: "row", justifyContent: "space-between", paddingBottom: 8, borderBottomWidth: 0.5, borderColor: theme.colors.border }, [
          text(ctx, settings.header.left, small),
          text(ctx, settings.header.right, { ...small, textAlign: "right" }),
        ]),
      ])
    );
  }
  if (settings.footer.enabled) {
    chrome.push(
      node({ type: "Fixed", position: "Footer" }, { paddingTop: 20 }, [
        view({ flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 0.5, borderColor: theme.colors.border }, [
          text(ctx, settings.footer.left, small),
          text(ctx, settings.footer.pageNumbers ? "Page {{pageNumber}} of {{totalPages}}" : "", { ...small, textAlign: "right" }),
        ]),
      ])
    );
  }

  const content = keepTogether(doc.blocks, ctx);
  const size = settings.orientation === "landscape" || settings.size === "Legal" ? { Custom: box } : settings.size;

  return {
    children: [
      node({ type: "Page", config: { size, margin: { top: margin, right: margin, bottom: margin, left: margin }, wrap: true } }, {}, [...chrome, ...content]),
    ],
    metadata: { title: doc.name, creator: "Orbit" },
    defaultPage: { size: "A4", margin: { top: margin, right: margin, bottom: margin, left: margin }, wrap: true },
  };
}
