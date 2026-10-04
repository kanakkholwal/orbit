import { tv, type VariantProps } from "tailwind-variants";

export const table = tv({
	slots: {
		container: "relative w-full overflow-x-auto",
		root: "w-full caption-bottom text-sm",
		header: "",
		body: "",
		footer: "font-medium text-muted-foreground",
		row: "transition-colors",
		head: "text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
		cell: "align-middle text-foreground [&:has([role=checkbox])]:pr-0",
		caption: "mt-4 text-sm text-muted-foreground",
	},
	variants: {
		variant: {
			default: {
				container: "rounded-xl border border-border",
				root: "border-collapse",
				header: "bg-card [&_tr]:border-border [&_tr]:border-b",
				body: "[&_tr:last-child]:border-0",
				footer: "border-border border-t bg-card [&>tr]:last:border-b-0",
				row: "border-border border-b hover:bg-foreground/[0.06] data-[state=selected]:bg-primary/[0.04]",
			},
			// The header sits on a card rim around a rounded inset body, and
			// hairlines split the columns. Separate borders, so cells can round the body corners.
			framed: {
				container: "rounded-2xl bg-card px-1 pb-1",
				root: "border-separate border-spacing-0",
				head: "relative text-xs after:absolute after:end-0 after:top-1/2 after:h-4 after:w-px after:-translate-y-1/2 after:bg-border last:after:hidden",
				body: [
					"[&>tr>td]:bg-background [&>tr:not(:last-child)>td]:border-border [&>tr:not(:last-child)>td]:border-b",
					"[&>tr:first-child>td:first-child]:rounded-tl-xl [&>tr:first-child>td:last-child]:rounded-tr-xl",
					"[&>tr:last-child>td:first-child]:rounded-bl-xl [&>tr:last-child>td:last-child]:rounded-br-xl",
				],
				footer: "[&>tr>td]:pt-2",
				row: "[&>td]:transition-colors hover:[&>td]:bg-card data-[state=selected]:[&>td]:bg-primary/[0.04]",
			},
		},
		density: {
			comfortable: { head: "px-3 py-2", cell: "px-3 py-2" },
			compact: { head: "px-3 py-1.5", cell: "px-3 py-1" },
		},
	},
	defaultVariants: { variant: "default", density: "comfortable" },
});

export type TableVariant = NonNullable<VariantProps<typeof table>["variant"]>;
export type TableDensity = NonNullable<VariantProps<typeof table>["density"]>;
