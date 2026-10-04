import { tv, type VariantProps } from "tailwind-variants";

/** Surface and rows shared by DropdownMenu, ContextMenu and Select in both ports. */
export const menu = tv({
	slots: {
		surface: "min-w-44 rounded-xl bg-popover p-1 shadow-(--overlay-shadow)",
		item: [
			"relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-md px-2.5 py-1.5",
			// The fill follows the pointer at once; a press squishes to 0.98 and eases back over 250ms.
			"text-left text-sm outline-none transition-[color,background-color,scale] [transition-duration:var(--duration-instant),var(--duration-instant),var(--duration-slow)] ease-[var(--ease-out-quart)]",
			"active:scale-[var(--press-scale-row)] motion-reduce:transition-none",
			"data-[highlighted]:bg-foreground/[0.06] data-[open]:bg-foreground/[0.06] data-[state=open]:bg-foreground/[0.06]",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			"data-[inset]:pl-8",
		],
		shortcut: "ml-auto shrink-0 text-muted-foreground text-xs",
		indicator:
			"pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center",
		// Draw and pop live in motion.css: they key off the row's checked state in both ports.
		check: "menu-check size-3.5 shrink-0",
		dot: "menu-dot block size-1.5 rounded-full bg-current",
	},
	variants: {
		variant: {
			default: { item: "text-foreground" },
			destructive: {
				item: "text-destructive-strong data-[highlighted]:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]",
			},
		},
	},
	defaultVariants: { variant: "default" },
});

export type MenuItemVariant = NonNullable<VariantProps<typeof menu>["variant"]>;
