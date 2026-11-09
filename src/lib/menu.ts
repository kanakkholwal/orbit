import { tv, type VariantProps } from "tailwind-variants";
import { anchoredSurface } from "./anchored-surface";

/** Surface and rows shared by DropdownMenu, ContextMenu and Select in both ports. */
export const menu = tv({
	slots: {
		surface: "min-w-44",
		item: [
			"relative flex w-full cursor-default select-none items-center justify-start gap-2 rounded-lg px-2.5 py-1.5",
			"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
			// rounded-lg is concentric with the rounded-xl p-1 surface. The fill follows the pointer
			// at once; a press squishes to 0.98 and eases back over 250ms.
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
		size: {
			xs: {
				surface: [
					anchoredSurface({ size: "xs" }).surface(),
					"min-w-36 p-0.5 [&_[role=menuitem]]:rounded-md [&_[role=menuitem]]:px-2 [&_[role=menuitem]]:py-1 [&_[role=menuitem]]:text-xs [&_[role=option]]:rounded-md [&_[role=option]]:px-2 [&_[role=option]]:py-1 [&_[role=option]]:text-xs [&_[role=menuitem]_svg:not([class*='size-'])]:size-3 [&_[role=option]_svg:not([class*='size-'])]:size-3",
				],
			},
			sm: {
				surface: [
					anchoredSurface({ size: "sm" }).surface(),
					"min-w-40 p-1 [&_[role=menuitem]]:rounded-md [&_[role=menuitem]]:px-2 [&_[role=menuitem]]:py-1.5 [&_[role=menuitem]]:text-xs [&_[role=option]]:rounded-md [&_[role=option]]:px-2 [&_[role=option]]:py-1.5 [&_[role=option]]:text-xs [&_[role=menuitem]_svg:not([class*='size-'])]:size-3.5 [&_[role=option]_svg:not([class*='size-'])]:size-3.5",
				],
			},
			default: {
				surface: [anchoredSurface().surface(), "min-w-44 p-1"],
			},
			lg: {
				surface: [
					anchoredSurface({ size: "lg" }).surface(),
					"min-w-48 p-1.5 [&_[role=menuitem]]:px-3 [&_[role=menuitem]]:py-2 [&_[role=option]]:px-3 [&_[role=option]]:py-2 [&_[role=menuitem]_svg:not([class*='size-'])]:size-4 [&_[role=option]_svg:not([class*='size-'])]:size-4",
				],
			},
			xl: {
				surface: [
					anchoredSurface({ size: "xl" }).surface(),
					"min-w-56 p-1.5 [&_[role=menuitem]]:rounded-xl [&_[role=menuitem]]:px-3 [&_[role=menuitem]]:py-2.5 [&_[role=menuitem]]:text-base [&_[role=option]]:rounded-xl [&_[role=option]]:px-3 [&_[role=option]]:py-2.5 [&_[role=option]]:text-base [&_[role=menuitem]_svg:not([class*='size-'])]:size-4.5 [&_[role=option]_svg:not([class*='size-'])]:size-4.5",
				],
			},
		},
		variant: {
			default: { item: "text-foreground" },
			destructive: {
				item: "text-destructive-strong data-[highlighted]:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]",
			},
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

export type MenuItemVariant = NonNullable<VariantProps<typeof menu>["variant"]>;
export type MenuSize = NonNullable<VariantProps<typeof menu>["size"]>;
