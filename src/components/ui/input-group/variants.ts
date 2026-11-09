import { tv, type VariantProps } from "tailwind-variants";
import { fieldText } from "$lib/control.js";

export const inputGroup = tv({
	slots: {
		root: [
			"group/input-group relative flex w-full min-w-0 items-center border border-input bg-(--field) outline-none",
			"transition-[box-shadow,border-color] duration-(--duration-fast) ease-(--ease-ui-out) motion-reduce:transition-none",
			"hover:border-border-strong",
			"has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20",
			"has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
			"has-[>textarea]:h-auto has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col",
			"has-[>[data-align=inline-start]]:[&>input]:pl-1.5 has-[>[data-align=inline-end]]:[&>input]:pr-1.5",
			"has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=block-end]]:[&>input]:pt-3",
		],
		text: "flex items-center gap-2 text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
		control:
			"h-full flex-1 rounded-none border-0 text-[length:inherit] md:text-[length:inherit] bg-transparent shadow-none ring-0 hover:border-0 focus-visible:border-0 focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0",
		textarea: "resize-none py-2.5",
		button: "flex items-center gap-2 shadow-none",
	},
	variants: {
		// The ladder's height, radius and text; the control inherits the text size from here.
		size: {
			xs: { root: ["h-6 rounded-sm", fieldText({ size: "xs" })] },
			sm: { root: ["h-8 rounded-md", fieldText({ size: "sm" })] },
			default: { root: ["h-9 rounded-lg", fieldText({ size: "default" })] },
			lg: { root: ["h-10 rounded-lg", fieldText({ size: "lg" })] },
			xl: { root: ["h-12 rounded-xl", fieldText({ size: "xl" })] },
		},
	},
	defaultVariants: { size: "default" },
});

export const inputGroupAddon = tv({
	base: [
		"flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 font-medium text-muted-foreground",
		"group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*='size-'])]:size-4",
	],
	variants: {
		align: {
			"inline-start": "order-first pl-3 has-[>button]:-ml-1 has-[>kbd]:-ml-1",
			"inline-end": "order-last pr-3 has-[>button]:-mr-1 has-[>kbd]:-mr-1",
			"block-start": "order-first w-full justify-start px-3 pt-3",
			"block-end": "order-last w-full justify-start px-3 pb-3",
		},
	},
	defaultVariants: { align: "inline-start" },
});

export type InputGroupSize = NonNullable<VariantProps<typeof inputGroup>["size"]>;
export type InputGroupAddonAlign = NonNullable<
	VariantProps<typeof inputGroupAddon>["align"]
>;

/** A click on an addon's padding focuses the group's control, as a label would. */
export function focusGroupControl(target: EventTarget | null, addon: HTMLElement): void {
	if (target instanceof Element && target.closest("button")) return;
	addon.parentElement
		?.querySelector<HTMLElement>("[data-slot=input-group-control]")
		?.focus();
}
