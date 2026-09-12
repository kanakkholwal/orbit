export type FontRole = "sans" | "serif" | "mono";

export interface CreatorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  fonts: { heading: FontRole; body: FontRole };
  headingWeight: 600 | 700;
  /** h1, h2, h3 sizes in points. */
  headingSizes: [number, number, number];
  bodySize: number;
  lineHeight: number;
  /** Space between blocks, in points. */
  gap: number;
  radius: number;
}

/** Built-in PDF fonts, so nothing is downloaded and output is identical offline. */
export const PDF_FONTS: Record<FontRole, string> = {
  sans: "Helvetica",
  serif: "Times-Roman",
  mono: "Courier",
};

export const CSS_FONTS: Record<FontRole, string> = {
  sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: '"Times New Roman", Times, serif',
  mono: '"Courier New", Courier, monospace',
};

const status = { success: "#16a34a", warning: "#d97706", danger: "#dc2626", info: "#2563eb" };

export const THEMES: CreatorTheme[] = [
  {
    id: "orbit",
    name: "Orbit",
    description: "Emerald accent, clean sans",
    colors: { primary: "#047857", accent: "#10b981", foreground: "#0a0a0a", muted: "#f5f5f5", mutedForeground: "#6b6b6b", border: "#e5e5e5", ...status },
    fonts: { heading: "sans", body: "sans" },
    headingWeight: 700,
    headingSizes: [28, 20, 15],
    bodySize: 10.5,
    lineHeight: 1.5,
    gap: 12,
    radius: 6,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Serif headings, zinc neutrals",
    colors: { primary: "#18181b", accent: "#3b82f6", foreground: "#18181b", muted: "#f4f4f5", mutedForeground: "#71717a", border: "#e4e4e7", ...status },
    fonts: { heading: "serif", body: "sans" },
    headingWeight: 700,
    headingSizes: [30, 21, 16],
    bodySize: 10.5,
    lineHeight: 1.5,
    gap: 14,
    radius: 4,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Slate with a violet accent",
    colors: { primary: "#4f46e5", accent: "#6366f1", foreground: "#0f172a", muted: "#f1f5f9", mutedForeground: "#64748b", border: "#e2e8f0", ...status },
    fonts: { heading: "sans", body: "sans" },
    headingWeight: 600,
    headingSizes: [28, 20, 15],
    bodySize: 10.5,
    lineHeight: 1.6,
    gap: 12,
    radius: 8,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Typewriter headings, lots of air",
    colors: { primary: "#18181b", accent: "#71717a", foreground: "#18181b", muted: "#fafafa", mutedForeground: "#8a8a93", border: "#e4e4e7", ...status },
    fonts: { heading: "mono", body: "sans" },
    headingWeight: 600,
    headingSizes: [22, 16, 13],
    bodySize: 10,
    lineHeight: 1.6,
    gap: 18,
    radius: 0,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Deep navy, serif authority",
    colors: { primary: "#1e3a5f", accent: "#1e40af", foreground: "#0f172a", muted: "#f1f5f9", mutedForeground: "#64748b", border: "#cbd5e1", ...status },
    fonts: { heading: "serif", body: "serif" },
    headingWeight: 700,
    headingSizes: [32, 22, 16],
    bodySize: 11,
    lineHeight: 1.5,
    gap: 16,
    radius: 2,
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Blue-gray and dependable",
    colors: { primary: "#0f4c81", accent: "#0ea5e9", foreground: "#1e293b", muted: "#f8fafc", mutedForeground: "#64748b", border: "#e2e8f0", ...status },
    fonts: { heading: "sans", body: "sans" },
    headingWeight: 700,
    headingSizes: [28, 20, 15],
    bodySize: 10.5,
    lineHeight: 1.5,
    gap: 13,
    radius: 4,
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Warm neutrals, amber details",
    colors: { primary: "#78350f", accent: "#b45309", foreground: "#1c1917", muted: "#fafaf9", mutedForeground: "#78716c", border: "#d6d3d1", ...status },
    fonts: { heading: "serif", body: "serif" },
    headingWeight: 700,
    headingSizes: [34, 22, 16],
    bodySize: 11,
    lineHeight: 1.6,
    gap: 16,
    radius: 2,
  },
  {
    id: "vivid",
    name: "Vivid",
    description: "Violet energy, rounded cards",
    colors: { primary: "#6d28d9", accent: "#8b5cf6", foreground: "#1e1b4b", muted: "#f5f3ff", mutedForeground: "#6b5fa8", border: "#ddd6fe", ...status },
    fonts: { heading: "sans", body: "sans" },
    headingWeight: 700,
    headingSizes: [30, 21, 15],
    bodySize: 10.5,
    lineHeight: 1.5,
    gap: 14,
    radius: 10,
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural greens, serif headings",
    colors: { primary: "#15803d", accent: "#16a34a", foreground: "#14532d", muted: "#f0fdf4", mutedForeground: "#4d7c5f", border: "#bbf7d0", ...status },
    fonts: { heading: "serif", body: "sans" },
    headingWeight: 700,
    headingSizes: [30, 21, 15],
    bodySize: 10.5,
    lineHeight: 1.5,
    gap: 14,
    radius: 6,
  },
  {
    id: "blueprint",
    name: "Blueprint",
    description: "Technical mono, cyan accent",
    colors: { primary: "#0f172a", accent: "#0891b2", foreground: "#0f172a", muted: "#f1f5f9", mutedForeground: "#475569", border: "#cbd5e1", ...status },
    fonts: { heading: "mono", body: "sans" },
    headingWeight: 700,
    headingSizes: [26, 18, 14],
    bodySize: 10,
    lineHeight: 1.5,
    gap: 14,
    radius: 0,
  },
];

export function getTheme(id: string, accent: string | null = null): CreatorTheme {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  return accent ? { ...theme, colors: { ...theme.colors, primary: accent, accent } } : theme;
}

export const PAGE_POINTS: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  Legal: [612, 1008],
  A5: [419.53, 595.28],
};

export const MARGIN_POINTS = { narrow: 32, normal: 54, wide: 72 } as const;

export function pageBox(size: string, orientation: "portrait" | "landscape"): { width: number; height: number } {
  const [w, h] = PAGE_POINTS[size] ?? PAGE_POINTS.A4;
  return orientation === "landscape" ? { width: h, height: w } : { width: w, height: h };
}

export function toneColor(theme: CreatorTheme, tone: string): string {
  switch (tone) {
    case "info":
      return theme.colors.info;
    case "success":
      return theme.colors.success;
    case "warning":
      return theme.colors.warning;
    case "danger":
      return theme.colors.danger;
    default:
      return theme.colors.primary;
  }
}

/** Mixes a hex colour toward white; `amount` 0..1 is how much of the colour stays. */
export function tint(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  const channels = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16));
  const mixed = channels.map((c) => Math.round(255 - (255 - c) * amount));
  return `#${mixed.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
