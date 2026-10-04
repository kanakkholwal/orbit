import { tv, type VariantProps } from "tailwind-variants";

/** Part names follow shadcn/ui; `variant` and `size` are set once on Breadcrumb and styled from it. */
export const breadcrumb = tv({
	slots: {
		root: "",
		list: "flex flex-wrap items-center gap-1.5 text-muted-foreground",
		item: "inline-flex items-center gap-1.5",
		link: "rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		page: "font-medium text-foreground",
		separator: "text-muted-foreground [&>svg]:size-3.5",
		// A DropdownMenuTrigger around it sets aria-expanded while its menu is open.
		ellipsis: [
			"grid size-7 place-items-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-(--duration-fast) ease-[var(--ease-out)]",
			"hover:bg-foreground/[0.06] hover:text-foreground in-[[aria-expanded=true]]:bg-foreground/[0.06] in-[[aria-expanded=true]]:text-foreground",
			"in-[button:active]:scale-[var(--press-scale-icon)] motion-reduce:transition-none [&>svg]:size-4",
		],
	},
	variants: {
		variant: {
			default: {},
			// The trail sits in a bar, for page headers that need it to read as one control.
			framed: {
				list: "w-fit rounded-lg border border-border bg-card px-3 py-1",
			},
		},
		size: {
			sm: { root: "text-xs", ellipsis: "size-6 [&>svg]:size-3.5" },
			md: { root: "text-sm" },
		},
	},
	defaultVariants: { variant: "default", size: "md" },
});

export type BreadcrumbVariant = NonNullable<VariantProps<typeof breadcrumb>["variant"]>;
export type BreadcrumbSize = NonNullable<VariantProps<typeof breadcrumb>["size"]>;
