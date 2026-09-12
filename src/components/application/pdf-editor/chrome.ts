import { tv, type VariantProps } from "tailwind-variants";

/** The one 36px control every button in the editor chrome is built from. */
export const chromeButton = tv({
  base: "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg text-body outline-none transition-colors duration-150 select-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
  variants: {
    shape: {
      icon: "w-9",
      text: "px-3",
      "icon-text": "pl-2.5 pr-3",
    },
    state: {
      idle: "cursor-pointer text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      active: "cursor-pointer bg-muted font-medium text-primary",
      disabled: "cursor-not-allowed text-placeholder",
    },
  },
  defaultVariants: { shape: "icon", state: "idle" },
});

export type ChromeButtonShape = NonNullable<VariantProps<typeof chromeButton>["shape"]>;

/** Floating surfaces in the editor: menus, selection menus, page controls. */
export const chromeFloating = "rounded-xl border border-border bg-popover text-popover-foreground shadow-lg";

export const chromeGap: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
};
