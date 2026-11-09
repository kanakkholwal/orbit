import { tv, type VariantProps } from "tailwind-variants";

/** Slides 250ms in, 200ms out; the scrim lands first (150ms) and leaves with the panel. */
export const sheet = tv({
	slots: {
		backdrop: [
			"fixed inset-0 z-50 bg-black/50 opacity-0 backdrop-blur-[2px]",
			"transition-opacity duration-[var(--duration-panel-exit)] ease-[var(--ease-drawer)]",
			"data-[state=open]:opacity-100 data-[state=open]:duration-[var(--duration-backdrop)]",
			"starting:data-[state=open]:opacity-0",
			"motion-reduce:transition-none",
		],
		body: "",
		// Only the closed state translates, so the open state needs no competing utility.
		panel: [
			"fixed z-50 flex flex-col shadow-(--overlay-shadow)",
			"transition-transform duration-[var(--duration-overlay)] ease-[var(--ease-drawer)]",
			"data-[state=closed]:duration-[var(--duration-panel-exit)]",
			"data-[state=closed]:data-[side=left]:-translate-x-full",
			"data-[state=closed]:data-[side=right]:translate-x-full",
			"data-[state=closed]:data-[side=top]:-translate-y-full",
			"data-[state=closed]:data-[side=bottom]:translate-y-full",
			"starting:data-[state=open]:data-[side=left]:-translate-x-full",
			"starting:data-[state=open]:data-[side=right]:translate-x-full",
			"starting:data-[state=open]:data-[side=top]:-translate-y-full",
			"starting:data-[state=open]:data-[side=bottom]:translate-y-full",
			"motion-reduce:transition-none",
		],
	},
	variants: {
		// Framed matches Dialog and Drawer: a card-step rim around a bordered popover body.
		variant: {
			default: {
				panel: "gap-4 overflow-y-auto bg-popover p-6",
				body: "contents",
			},
			framed: {
				panel: "bg-card p-1",
				body: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-[11px] border border-border bg-popover p-5",
			},
		},
		side: {
			left: { panel: "inset-y-0 left-0 h-full w-[min(22rem,100vw)]" },
			right: { panel: "inset-y-0 right-0 h-full w-[min(22rem,100vw)]" },
			top: { panel: "inset-x-0 top-0 w-full max-h-[80vh]" },
			bottom: { panel: "inset-x-0 bottom-0 w-full max-h-[80vh] rounded-t-2xl" },
		},
	},
	compoundVariants: [
		{ variant: "framed", side: "left", class: { body: "rounded-l-none" } },
		{ variant: "framed", side: "right", class: { body: "rounded-r-none" } },
		{ variant: "framed", side: "top", class: { body: "rounded-t-none" } },
		{ variant: "framed", side: "bottom", class: { body: "rounded-b-none" } },
	],
	defaultVariants: { variant: "default", side: "right" },
});

export type SheetVariant = NonNullable<VariantProps<typeof sheet>["variant"]>;

export type SheetSide = NonNullable<VariantProps<typeof sheet>["side"]>;
