import { tv, type VariantProps } from "tailwind-variants";

/**
 * Shared modal contract: Dialog, AlertDialog and Command frame the same way. Base UI emits
 * `data-open`/`data-closed`, bits-ui `data-state`, so both are written out.
 */
export const dialogFrame = tv({
	slots: {
		// Fades in step with the panel; the primitive owns the top layer and inertness.
		backdrop: [
			"fixed inset-0 z-50 bg-black/50 opacity-0 backdrop-blur-[2px]",
			"transition-opacity duration-[var(--duration-exit)] ease-[var(--ease-out)]",
			"data-[open]:opacity-100 data-[open]:duration-[var(--duration-dropdown)]",
			"data-[state=open]:opacity-100 data-[state=open]:duration-[var(--duration-dropdown)]",
			"starting:data-[open]:opacity-0 starting:data-[state=open]:opacity-0",
			"motion-reduce:transition-none",
		],
		// Zooms down from 1.05 on the way in, out to 0.95; no travel either way.
		popup: [
			"fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 overflow-visible outline-none",
			"transition-[opacity,scale] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
			"data-[closed]:opacity-0 data-[closed]:scale-[var(--popover-exit-scale)] data-[closed]:duration-[var(--duration-exit)]",
			"data-[state=closed]:opacity-0 data-[state=closed]:scale-[var(--popover-exit-scale)] data-[state=closed]:duration-[var(--duration-exit)]",
			"starting:data-[open]:opacity-0 starting:data-[open]:scale-[var(--modal-enter-scale)]",
			"starting:data-[state=open]:opacity-0 starting:data-[state=open]:scale-[var(--modal-enter-scale)]",
			"motion-reduce:transition-none",
		],
		panel: "rounded-2xl shadow-(--overlay-shadow)",
		// The icon-only close in the corner; a close with children styles itself.
		close:
			"absolute top-3 right-3 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		footer: "flex items-center justify-end gap-2",
		body: "relative overflow-hidden",
	},
	variants: {
		variant: {
			// The rim is the card surface; a hairline, not a lighter shade, lifts the body off it.
			framed: {
				panel: "bg-card p-1",
				footer: "px-2 pt-2 pb-1",
				body: "rounded-[11px] border border-border bg-popover p-5",
			},
			default: { panel: "bg-popover p-6", footer: "pt-6", body: "" },
		},
	},
	defaultVariants: { variant: "default" },
});

export type DialogVariant = NonNullable<VariantProps<typeof dialogFrame>["variant"]>;

/** Dialog-only: AlertDialog and Command set their own fixed panel width. */
export const dialogWidth = tv({
	variants: {
		size: {
			sm: "max-w-sm",
			md: "max-w-lg",
			lg: "max-w-2xl",
			xl: "max-w-4xl",
		},
	},
	defaultVariants: { size: "md" },
});

export type DialogSize = NonNullable<VariantProps<typeof dialogWidth>["size"]>;
